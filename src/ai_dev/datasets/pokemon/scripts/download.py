from .pokemontcgapi import PokemonTCGAPI
import os
import json
import requests
import zipfile
import shutil
import tqdm

def download():
    # API key can be obtained at https://dev.pokemontcg.io/
    api_key = input("Enter your Pokemon TCG API key: ").strip()

    get_prices = input("enter (f) for fast download for training dataset, (s) for slow download with pricing data, or (i) for only imazges if metadata exists:").strip().lower()

    if get_prices == 's':
        print("downloading with pricing data, this may take a while...")
        download_with_pricing(api_key)
    elif get_prices == "f":
        print("downloading fast without pricing data...")
        download_fast(api_key)
    elif get_prices == "i":
        print("downloading images only...")
        download_images(api_key)

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

    print("download metadata, saved to ai_dev/datasets/pokemon/data/")

    download_images(api_key)

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

    download_images(api_key)

def download_images(api_key: str):
    image_paths = []

    print("reading image urls...")

    # find all image paths
    for filename in os.listdir("data"):
        if not (filename.startswith("cards_") and filename.endswith(".json")):
            continue

        # open set
        set_file = os.path.join("data", filename)
        with open(set_file, "r", encoding="utf-8") as f:
            cards = json.load(f)


        # create folder for set images
        set_id = filename[len("cards_"):-len(".json")]
        images_dir = os.path.join("data", "images", set_id)
        os.makedirs(images_dir, exist_ok=True)
        
        for card in cards:
            image_paths.append({"id": card["id"], "url": card["images"]["large"], "dir": images_dir})

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

    print("download images, saved to ai_dev/datasets/pokemon/data/images/")