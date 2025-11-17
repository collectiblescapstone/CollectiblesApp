# run inside src/ai_dev/datasets/pokemon with `python run.py`
#
# estimated times:
# metadata download time: ~8 minutes
# image download time: 5-6 hours
# dataset generation time: ~8 minutes * variants per card (default 4)

from scripts.download import download

if __name__ == "__main__":
    # arguments are used by dataset generation
    download(variants_per_card=4, filters=True, transformations=True, occlusions=True)