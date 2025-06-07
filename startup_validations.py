from typing import Union, cast

from pydantic import ValidationError
from pydantic_core import ErrorDetails
from songs.entities.playlist_input import PlaylistInput


def validate_json_file(data: object):
    '''
    Function to validate the given data against the `PlaylistInput` class.

    :raises ValidationError: If data is improperly formatted, or if any key contains an unequal # of keys.
    '''
    res = PlaylistInput.model_validate(data)
    value_dicts: list[dict[str, Union[int, float, str]]] = list(res.__dict__.values())
    if not value_dicts:
        print("No data in file, continuing as-is.")
        return
    reference_keys = set(value_dicts[0].keys())
    reference_len = len(reference_keys)
    for key, value in res.__dict__.items():
        value_dict = cast(dict[str, Union[int, float, str]], value)
        keys = set(value_dict.keys())
        if len(keys) != reference_len:
            print(f"Entry {key} does not have {reference_len} keys: {keys}")
            raise ValidationError([
                ErrorDetails(
                    type='value_error.dict.keys_length_mismatch',
                    loc=(key,),
                    msg=f"Entry {key} has unequal number of entries: {len(keys)} vs {reference_len}",
                    input=value_dict
                )
            ])
        if keys != reference_keys:
            raise ValidationError([
                ErrorDetails(
                    type='value_error.dict.keys_mismatch',
                    loc=(key,),
                    msg=f"Entry {key} has different keys: {keys} vs {reference_keys}",
                    input=value_dict
                )
            ])
        