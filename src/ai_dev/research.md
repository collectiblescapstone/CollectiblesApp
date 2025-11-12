# AI Research

## Card detection from camera

> **Tl;dr**: We’ll use OpenCV to get the cards’ location. I think we can just copy how https://github.com/NolanAmblard/Pokemon-Card-Scanner did it.

https://github.com/NolanAmblard/Pokemon-Card-Scanner

- Uses OpenCV to get the cards' location and transforms the card into a rectangle.
- Passes that rectangle into a perceptual hashing mechanism with 4 different hashing methods.
- Each hashing method is created with the card normal, mirrored, upside down, and upside down and mirrored.
- A smaller distance between the card and the hashes indicates more similarity.
- You can tune a threshold to consider a card and its hash alike if the distance between them is less than the threshold.

https://www.youtube.com/watch?v=BLy_YF4nmqQ rust perceptual hashing with card identification

https://www.researchgate.net/publication/382197984_Perceptual_Hashing_Using_Pretrained_Vision_Transformers

- Mix of perceptual hashing and deep learning

## Card classification methods with input from above

> **Tl;dr**: We’ll try CLIP first, then if it’s too slow, use perceptual hashing for image-to-image classification. We’ll probably still use CLIP for text-to-image.

https://huggingface.co/blog/not-lain/image-retriever

- Using CLIP, walks through creating embeddings for images or text, creating embeddings for the input image, and then getting the nearest example.

https://blog.roboflow.com/image-search-engine-gaudi2/

- Using CLIP to search for an image with an image.
- Creating vector embeddings for each of your images.

https://medium.com/codex/building-a-powerful-image-search-engine-for-your-pictures-using-deep-learning-16d06df10385

- https://github.com/ManuelFay/ImageSearcher
- Using CLIP but in reverse so that you can query images with natural language.

## Data to train the classifier

> **Tl;dr**: We’ll use https://github.com/PokemonTCG/pokemon-tcg-data/tree/master since it contains the JSON data from the API, which is pretty up-to-date and the API is slow af.

https://huggingface.co/datasets/TheFusion21/PokemonCards

- Pokemon card dataset with captions for each card

https://github.com/PokemonTCG/pokemon-tcg-sdk-python

- SDK for python for pokemon cards
- `Card.all()`
- Instead of dealing with APIs, we can just use the jsons available in cards/en in https://github.com/PokemonTCG/pokemon-tcg-data/tree/master
