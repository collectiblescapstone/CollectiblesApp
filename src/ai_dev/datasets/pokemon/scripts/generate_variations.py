from .util import read_image_paths
import os
import tqdm
from PIL import Image, ImageFilter, ImageEnhance
from random import random, choice, randrange
import math

# will generate n variations per card image, with random combinations of the selected options
def generate_variations(variants_per_card:int = 4, filters:bool = True, transformations:bool = False, occlusions:bool = False):

    image_paths = read_image_paths()

    # iterate over all images
    for image_info in tqdm.tqdm(image_paths):
        image_id = image_info["id"]
        images_dir = image_info["dir"]
        image_path = os.path.join(images_dir, f"{image_id}.jpg")


        save_dir = images_dir.replace("images", "image_variations")
        
        if os.path.exists(os.path.join(save_dir, f"{image_id}_variant_0.jpg")):
            # skip if variants already exist
            continue

        # generate variants
        for i in range(variants_per_card):
        
            # open image
            img = Image.open(image_path)

            # each option will be applied with 50% chance, or guaranteed if it's the only one selected

            # filters
            if filters and not ((transformations or occlusions) and random() < 0.5):
                
                # apply random filter sometimes
                if random() < 0.5:
                    filter_choice = choice([
                        ImageFilter.BLUR,
                        ImageFilter.DETAIL,
                        ImageFilter.SMOOTH,
                    ])
                    img = img.filter(filter_choice)

                # apply random enhancement
                enhance_choice = random()
                if enhance_choice < 0.33:
                    img = ImageEnhance.Color(img).enhance(0.6 + random() * 0.8)
                elif enhance_choice < 0.66:
                    img = ImageEnhance.Contrast(img).enhance(0.5 + random())
                else:
                    img = ImageEnhance.Brightness(img).enhance(0.5 + random())

            # transformations
            if transformations and not ((occlusions or filters) and random() < 0.5):

                # apply random transformation
                fill = choice([(255,255,255), (0,0,0)])
                img = img.transform(img.size, Image.AFFINE, (1+random()/20-0.025, random()/20-0.025, 0, random()/20-0.025, 1+random()/20-0.025, 0), fillcolor=fill)

            if occlusions and not ((transformations or filters) and random() < 0.5):

                # apply random occlusions
                for _ in range(1 + int(random() * 7)):
                    width, height = img.size
                    area = random() * width * height * 0.02
                    occ_width = randrange(4, max(int(math.sqrt(area)), 6))
                    occ_height = int(area / occ_width)

                    occ_x = int(random() * width)
                    occ_y = int(random() * (height - occ_height))

                    occ_color = choice([(255,255,255), (255,255,255), (255,255,255), (0,0,0)])
                    angle = random()*45
                    occ = Image.new("RGBA", (occ_width, occ_height), occ_color)
                    occ = occ.rotate(angle, expand=True, fillcolor=(0,0,0,0))
                    img.paste(occ, (occ_x, occ_y), occ)

            # save variant
            os.makedirs(save_dir, exist_ok=True)
            variant_path = os.path.join(save_dir, f"{image_id}_variant_{i}.jpg")
            img.save(variant_path)
