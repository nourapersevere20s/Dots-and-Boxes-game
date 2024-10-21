from GameMove import GameMove
from GameConfig import GameConfig

class AIPlayer:
    def get_action(self, config: GameConfig) -> GameMove:
        raise NotImplementedError()
