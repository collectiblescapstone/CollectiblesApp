from .pokemontcgapi import PokemonTCGAPI
from .util import read_image_paths
from .generate_variations import generate_variations
import os
import json
import requests
import zipfile
import shutil
import tqdm
import re

def download(variants_per_card:int = 4, filters:bool = True, transformations:bool = False, occlusions:bool = False):
    # API key can be obtained at https://dev.pokemontcg.io/
    api_key = input("Enter your Pokemon TCG API key: ").strip()

    # prompt user for where to resume in the downloading and creation process
    #  1/2 for downloading metadata
    #  3 for downloading images
    #  4 for generating dataset using base images
    # each step will 
    selection = input("(1) for fast download for training dataset \n (2) for slow download with pricing data \n (3) for only images if metadata exists \n (4) for dataset generation if metadata and images exist \n->").strip().lower()
    if len(selection) < 1:
        print("no selection made, aborting")
        return
    selection = selection[0]

    if "1" in selection:
        print("downloading fast without pricing data...")
        download_fast(api_key)

    elif "2" in selection:
        print("downloading with pricing data, this may take a while...")
        download_with_pricing(api_key)

    if "3" in selection or "1" in selection or "2" in selection:
        print("downloading images...")
        sanitize_ids()
        download_images(api_key)

    input(f"will generate ~{int(variants_per_card*13.5)}GB of image variations for training, make sure you have enough disk space. Press Enter to continue...")

    print("generating image variations...")
    generate_variations(variants_per_card, filters, transformations, occlusions)

# uses the tcgapi to download all card metadata with pricing information
def download_with_pricing(api_key: str):
    client = PokemonTCGAPI()

    client.configure(api_key)

    # create data directory
    print("creating data directory...")
    os.makedirs("data", exist_ok=True)

    # download sets
    print("downloading sets...")
    sets = client.sets()
    with open("data/sets.json", "w", encoding="utf-8") as f:
        json.dump(sets, f, indent=4)

    # download cards for each set
    for s in tqdm.tqdm(sets, desc="Downloading cards for sets"):
        set_id = s["id"]

        set_file = f"data/cards_{set_id}.json"
        
        # skip if already downloaded
        if os.path.exists(set_file):
            print(f"cards for set {set_id} already downloaded, skipping...")
            continue

        # download cards for set
        print(f"downloading cards for set {set_id}...")
        cards = client.cards_from_set_id(set_id)
    
        with open(set_file, "w", encoding="utf-8") as f:
            json.dump(cards, f, indent=4)

    print("Downloaded metadata, saved to ai_dev/datasets/pokemon/data/")


# downloads a zip file of the repo the tcgapi pulls data from, does not include pricing data
def download_fast(api_key: str):
    os.makedirs("data", exist_ok=True)
    os.makedirs("temp", exist_ok=True)

    # download zip from github
    github_url = "https://github.com/PokemonTCG/pokemon-tcg-data/archive/refs/heads/master.zip"
    response = requests.get(github_url, stream=True)
    response.raise_for_status()

    # save zip
    with open("temp/pokemon-tcg-data.zip", "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)

    # extract zip
    with zipfile.ZipFile("temp/pokemon-tcg-data.zip", "r") as zip_ref:
        zip_ref.extractall("temp")

    # move files
    extracted_path = "temp/pokemon-tcg-data-master/cards/en"
    for filename in os.listdir(extracted_path):
        src_file = os.path.join(extracted_path, filename)
        dest_file = os.path.join("data", f"cards_{filename}")
        os.replace(src_file, dest_file)
    os.replace("temp/pokemon-tcg-data-master/sets/en.json", "data/sets.json")

    # cleanup
    shutil.rmtree("temp")

    print("download metadata, saved to ai_dev/datasets/pokemon/data/")

# sanitize card ids to remove invalid filename characters, as ids are used as filenames
def sanitize_ids():
    print("sanitizing card ids...")
    for filename in os.listdir("data"):
        if not (filename.startswith("cards_") and filename.endswith(".json")):
            continue

        # open set
        set_file = os.path.join("data", filename)
        with open(set_file, "r", encoding="utf-8") as f:
            cards = json.load(f)

        # sanitize ids
        for card in cards:
            card_id = card["id"]
            new_id = re.sub(r"[<>:\"/\\|?*]", "_", card_id)
            if new_id != card_id:
                print(f"sanitized id {card_id} to {new_id}")
                card["id"] = new_id

        # save set
        with open(set_file, "w", encoding="utf-8") as f:
            json.dump(cards, f, indent=4)

def download_images(api_key: str):

    print("reading image urls...")

    image_paths = read_image_paths()

    # download images
    for image_info in tqdm.tqdm(image_paths, desc="Downloading card images"):
        image_id = image_info["id"]
        image_url = image_info["url"]
        images_dir = image_info["dir"]
        image_file = os.path.join(images_dir, f"{image_id}.png")

        # skip if already exists
        if os.path.exists(image_file):
            continue

        # download image
        try:
            response = requests.get(image_url, stream=True, headers={"X-Api-Key": api_key})
            response.raise_for_status()

            with open(image_file, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)

        except requests.exceptions.RequestException as e:
            print(f"failed to download image {image_id} from {image_url}: {e}")  

    print("download images, saved to src/ai_dev/datasets/pokemon/data/images/")