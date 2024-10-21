from typing import NamedTuple, Literal, Tuple
class GameMove(NamedTuple):
    action_type: Literal["row", "col"]
    position: Tuple[int, int]
