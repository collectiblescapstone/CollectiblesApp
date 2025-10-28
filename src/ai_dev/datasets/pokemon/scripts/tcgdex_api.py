import requests
import tqdm

BASE_URL = "https://api.tcgdex.net/v2"
EXCLUDE_SERIES = ["tcgp"] # exclude tcg pocket cards

# downloads metadata and images from the TCGDex API https://www.tcgdex.net/
# language: language code string, possibilities can be found at https://github.com/tcgdex/cards-database/blob/master/interfaces.d.ts#L1-L5
#   at time of writing:  
#   international languages:  'en' | 'fr' | 'es' | 'es-mx' | 'it' | 'pt' | 'pt-br' | 'pt-pt' | 'de' | 'nl' | 'pl' | 'ru' 
#   asian languages:  'ja' | 'ko' | 'zh-tw' | 'id' | 'th' | 'zh-cn'
class TCGDexAPI:
    def __init__(self, language_code: str = "en"):
        self.__base_url = BASE_URL
        self.__exclude_series = EXCLUDE_SERIES
        
        self.language_code = language_code

    # performs a GET request to the specified URL with the given parameters
    def __get_req(self, url: str, params: dict = {}) -> dict:
        headers = { 'User-Agent': 'Mozilla/5.0'}

        try:
            response = requests.get(url, params=params, headers=headers, timeout=60)
            response.raise_for_status()
            return response.json()
        
        except (requests.exceptions.RequestException, requests.exceptions.ConnectionError, 
                requests.exceptions.HTTPError, requests.exceptions.TooManyRedirects, 
                requests.exceptions.ConnectTimeout, requests.exceptions.ReadTimeout, 
                requests.exceptions.JSONDecodeError) as err:
            raise Exception(f"error occurred in tcgdex GET request: {err}")
    
    # constructs full URL for a given endpoint
    def __endpoint_url(self, endpoint: str) -> str:
        return f"{self.__base_url}/{self.language_code}/{endpoint}"

    # returns list of all series (groups of sets)
    # response structure: https://tcgdex.dev/rest/series
    def series(self) -> list:
        url = self.__endpoint_url("series")
        ret = self.__get_req(url)
        return [x for x in ret if x["id"] not in self.__exclude_series]
    
    # returns list of all sets (groups of cards)
    # response structure: https://tcgdex.dev/rest/serie
    def sets(self) -> list:
        series = self.series()
        
        all_sets = []

        for s in tqdm.tqdm(series, desc="Fetching sets of all series"):
            url = self.__endpoint_url(f"series/{s['id']}")
            sets_in_series = self.__get_req(url)
            all_sets.extend(sets_in_series["sets"])
        return all_sets
    
    # returns all cards from a set as a dictionary
    # response structure: https://tcgdex.dev/rest/set, https://tcgdex.dev/rest/card
    def cards_from_set_id(self, set_id: str) -> list:
        set_url = self.__endpoint_url(f"sets/{set_id}")
        ret = self.__get_req(set_url)

        cards = ret["cards"]
        cards_detailed = []

        for c in tqdm.tqdm(cards, desc=f"downloading metadata for cards in set {set_id}"):
            if c['id'] == "exu-%3F":  # skip id that causes server issue
                cards_detailed.append(c)
                continue
            card_url = self.__endpoint_url(f"cards/{c['id']}")
            card_obj = self.__get_req(card_url)
            cards_detailed.append(card_obj)

        ret["cards"] = cards_detailed
        return ret

    # saves a 600x825 jpg image from a URL to a file
    # image downloading: https://tcgdex.dev/assets
    def save_image_to(self, url:str, file_path:str):
        try:
            response = requests.get(f"{url}/high.jpg", stream=True)
            response.raise_for_status()

            with open(file_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)

        except requests.exceptions.RequestException as e:
            print(f"failed to download image from {url}: {e}")