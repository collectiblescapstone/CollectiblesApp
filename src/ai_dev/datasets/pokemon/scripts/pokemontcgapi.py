import time
import requests

# downloads metadata and images from the Pokemon TCG API https://pokemontcg.io/
# 
# API key can be obtained at https://dev.pokemontcg.io/
class PokemonTCGAPI:
    __api_key = None
    __request_delay = 1  # seconds to wait between requests to avoid rate limiting

    # performs a GET request to the specified URL with the given parameters
    @classmethod
    def __get_req(cls, url: str, params: dict = {}) -> dict:

        # ensure API key is set
        if cls.__api_key is None:
            raise ValueError("API key is not configured. Please call RestClient.configure(api_key) first.")
        headers = { 'User-Agent': 'Mozilla/5.0', 'X-Api-Key': cls.__api_key }

        try:
            response = requests.get(url, params=params, headers=headers, timeout=60)
            response.raise_for_status()
            return response.json()
        
        except (requests.exceptions.RequestException, requests.exceptions.ConnectionError, 
                requests.exceptions.HTTPError, requests.exceptions.TooManyRedirects, 
                requests.exceptions.ConnectTimeout, requests.exceptions.ReadTimeout, 
                requests.exceptions.JSONDecodeError) as err:
            raise Exception(f"error occurred in PokemonTCGAPI GET request: {err}")

    # retrieves all items from a paginated endpoint
    # return: list of a dict for each page of results
    @classmethod
    def __get_all(cls, url: str, params: dict = {}) -> list:
        items = []
        # params["pageSize"] = 250  # Set the page size to 250
        params['page'] = 1

        while True:
            response = cls.__get_req(url, params)

            if not response:
                print(f"no response received from {url} with params {params}")
                break

            # print current and total card count
            print(f"Page {params['page']}: Count = {response.get('count', 0)}, Total Count = {response.get('totalCount', 0)}")
            
            # add found cards
            prev_len = len(items)
            if len(response["data"]) > 0:
                items.extend(response["data"])
            else:
                break

            # continue with delay if more pages exist
            if response['count'] + prev_len < response['totalCount']:
                params['page'] += 1
                time.sleep(cls.__request_delay)
            else:
                break
        
        return items
    
    # sets API key, and optionally the delay between requests
    @classmethod
    def configure(cls, api_key: str, request_delay: int = 1) -> None:
        cls.__api_key = api_key
        cls.__request_delay = request_delay
    
    # returns all cards from a set as a dictionary
    @classmethod
    def cards_from_set_id(cls, set_id: str) -> list:
        url = "https://api.pokemontcg.io/v2/cards"
        params = {'q': f'set.id:{set_id}', 'select': 'id,name,supertype,subtypes,artist,rarity,tcgplayer'}
        return cls.__get_all(url, params)
    
    # returns all set ids
    @classmethod
    def sets(cls) -> list:
        url = "https://api.pokemontcg.io/v2/sets"
        params = {}
        return cls.__get_all(url, params)
    
    def __init__(self):
        pass