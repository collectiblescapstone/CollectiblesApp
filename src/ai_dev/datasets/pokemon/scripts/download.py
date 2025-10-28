from .tcgdex_api import TCGDexAPI
from .util import read_image_paths
from .generate_variations import generate_variations
import os
import json
import tqdm
import re

# downloads metadata, images, and generates image variations for dataset
# will generate n variations per card image, with random combinations of the selected options
def download(variants_per_card:int = 4, filters:bool = True, transformations:bool = False, occlusions:bool = False):
    # prompt user for where to resume in the downloading and creation process
    # the options are to select where in the script to start/resume the download/generation process,
    # this is necessary for us to be able to resume after potential errors
    #
    #  1 for downloading metadata
    #  2 for downloading images
    #  3 for generating dataset using base images

    selection = input("(1) for metadata download \n (2) start at image download if metadata exists \n (3) start at dataset generation if metadata and images exist \n->").strip()
    if len(selection) < 1:
        print("no selection made, aborting")
        return
    selection = selection[0]

    if "1" in selection:
        print("downloading metadata...")
        download_metadata()

    if "1" in selection or "2" in selection:
        print("downloading images...")
        sanitize_ids()
        download_images()

    input(f"will generate ~{int(variants_per_card*4)}GB of image variations for training, make sure you have enough disk space. Press Enter to continue...")

    print("generating image variations...")
    generate_variations(variants_per_card, filters, transformations, occlusions)

# uses the tcgdex api to download all card metadata with pricing information
def download_metadata():
    client = TCGDexAPI("en")

    # create data directory
    print("creating data directory...")
    os.makedirs("data", exist_ok=True)

    # download sets
    sets = client.sets()
    with open("data/sets.json", "w", encoding="utf-8") as f:
        json.dump(sets, f)

    # download cards for each set
    for s in tqdm.tqdm(sets, desc="Downloading cards for sets"):
        set_id = s["id"]

        set_file = f"data/cards_{set_id}.json"
        
        # skip if already downloaded
        if os.path.exists(set_file):
            print(f"cards for set {set_id} already downloaded, skipping...")
            continue

        # download cards for set
        cards = client.cards_from_set_id(set_id)
    
        with open(set_file, "w", encoding="utf-8") as f:
            json.dump(cards, f)

    print("Downloaded metadata, saved to ai_dev/datasets/pokemon/data/")

# sanitize card ids to remove invalid filename characters, as ids are used as filenames
def sanitize_ids():
    print("sanitizing card ids...")
    for filename in os.listdir("data"):
        if not (filename.startswith("cards_") and filename.endswith(".json")):
            continue

        # open set
        set_file = os.path.join("data", filename)
        with open(set_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        # sanitize ids
        for card in data["cards"]:
            card_id = card["id"]
            new_id = re.sub(r"[<>:\"/\\|?*]", "_", card_id)
            if new_id != card_id:
                print(f"sanitized id {card_id} to {new_id}")
                card["id"] = new_id

        # save set
        with open(set_file, "w", encoding="utf-8") as f:
            json.dump(data, f)

def download_images():

    print("reading image urls...")

    image_paths = read_image_paths()

    api_client = TCGDexAPI("en")

    # download images
    for image_info in tqdm.tqdm(image_paths, desc="Downloading card images"):
        image_id = image_info["id"]
        image_url = image_info["url"]
        images_dir = image_info["dir"]
        image_file = os.path.join(images_dir, f"{image_id}.jpg")

        # skip if already exists
        if os.path.exists(image_file):
            continue

        # download image
        api_client.save_image_to(image_url, image_file)

    print("Downloaded images, saved to src/ai_dev/datasets/pokemon/data/images/")