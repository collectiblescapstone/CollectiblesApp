import os
import json

def read_image_paths() -> list:
    ret = []
    # find all image paths
    for filename in os.listdir("data"):
        if not (filename.startswith("cards_") and filename.endswith(".json")):
            continue

        # open set
        set_file = os.path.join("data", filename)
        with open(set_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        cards = data["cards"]

        # create folder for set images
        set_id = filename[len("cards_"):-len(".json")]
        images_dir = os.path.join("data", "images", set_id)
        os.makedirs(images_dir, exist_ok=True)
        
        for card in cards:
            if "image" not in card:
                continue
            ret.append({"id": card["id"], "url": card["image"], "dir": images_dir})
            
    return ret

