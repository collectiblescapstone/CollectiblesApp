import {
  AutoTokenizer,
  CLIPTextModelWithProjection,
  type PreTrainedTokenizer,
  type PreTrainedModel,
} from '@xenova/transformers';

export const CardSearcher = async () => {
  let tokenizer!: PreTrainedTokenizer;
  let textModel!: PreTrainedModel;

  const init = async () => {
    // Initialize Transformers.js
    const model_id = 'Xenova/clip-vit-base-patch32';
    tokenizer = await AutoTokenizer.from_pretrained(model_id);
    textModel = await CLIPTextModelWithProjection.from_pretrained(model_id);

    // Load and decompress gzip'd embeddings binary file
    const CACHE_NAME = 'pokemon-embeddings-cache';
    const fileUrl = '/pokemon_embeddings.bin.gz';

    const cache = await caches.open(CACHE_NAME);
    let response = await cache.match(fileUrl);

    if (!response) {
      response = await fetch(fileUrl);
      cache.put(fileUrl, response.clone());
    }

    const ds = new DecompressionStream('gzip');
    const decompressedStream = response.body?.pipeThrough(ds);
    const jsonResponse = new Response(decompressedStream);
    return (await jsonResponse.json()) as { [cardId: string]: number[] };
  };

  const embeddings = await init();

  const search = async (query: string) => {
    // Convert query text to vector
    const inputs = tokenizer(query);
    const { text_embeds } = await textModel(inputs);
    const queryVector = text_embeds.data;

    // Perform search (dot product)
    const matches = [];
    for (const [id, vector] of Object.entries(embeddings)) {
      let score = 0;
      for (let i = 0; i < queryVector.length; i++) {
        score += queryVector[i] * vector[i];
      }

      matches.push({ id, score });
    }

    // Sort
    const sorted = matches.sort((a, b) => b.score - a.score).slice(0, 15);

    return sorted;
  };

  return search;
};
