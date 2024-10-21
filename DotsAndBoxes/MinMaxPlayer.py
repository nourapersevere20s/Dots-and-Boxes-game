from AIPlayer import AIPlayer
from GameMove import GameMove
from GameConfig import GameConfig
from time import time
from typing import List
import numpy as np

TIME_OUT = 4.995
class MinMaxPlayer(AIPlayer):
    def __init__(self):
        self.global_counter = 0
        self.is_player = True

    def create_actions(self, state: GameConfig) -> List[GameMove]:
        row_pos = self.populate_positions(state.row_status)
        col_pos = self.populate_positions(state.col_status)
        moves: List[GameMove] = []
        for pos in row_pos:
            moves.append(GameMove("row", pos))
        for pos in col_pos:
            moves.append(GameMove("col", pos))
        return moves


    def get_action(self, config: GameConfig) -> GameMove:
        self.is_player = config.player1_turn
        sel_action: GameMove = None
        self.global_counter = time() + TIME_OUT
        row_count_not_filled = np.count_nonzero(config.row_status == 0)
        column_count_not_filled = np.count_nonzero(config.col_status == 0)
        for id in range(row_count_not_filled + column_count_not_filled):
            try:
                moves = self.create_actions(config)
                utilities = np.array([self.get_minimax(
                    config=self.get_result(config, action), max_depth=id + 1) for action in moves])
                idx = np.random.choice(
                    np.flatnonzero(utilities == utilities.max()))
                sel_action = moves[idx]
            except TimeoutError:
                break
        return sel_action

    def get_result(self, config: GameConfig, move: GameMove) -> GameConfig:
        move_dir = move.action_type
        xPos, yPos = move.position
        new_config = GameConfig(
            config.board_status.copy(),
            config.row_status.copy(),
            config.col_status.copy(),
            config.player1_turn,
        )
        modifier_value = -1 if new_config.player1_turn else 1
        is_scored = False
        extra_val = 1
        [ny, nx] = new_config.board_status.shape
        if yPos < ny and xPos < nx:
            new_config.board_status[yPos, xPos] = (
                abs(new_config.board_status[yPos, xPos]) + extra_val
            ) * modifier_value
            if abs(new_config.board_status[yPos, xPos]) == 4:
                is_scored = True
        if move_dir == "row":
            new_config.row_status[yPos, xPos] = 1
            if yPos > 0:
                new_config.board_status[yPos - 1, xPos] = (
                    abs(new_config.board_status[yPos - 1, xPos]) + extra_val
                ) * modifier_value
                if abs(new_config.board_status[yPos - 1, xPos]) == 4:
                    is_scored = True
        elif move_dir == "col":
            new_config.col_status[yPos, xPos] = 1
            if xPos > 0:
                new_config.board_status[yPos, xPos - 1] = (
                    abs(new_config.board_status[yPos, xPos - 1]) + extra_val
                ) * modifier_value
                if abs(new_config.board_status[yPos, xPos - 1]) == 4:
                    is_scored = True

        new_config = new_config._replace(
            player1_turn=not (new_config.player1_turn ^ is_scored)
        )
        return new_config

    def populate_positions(self, board: np.ndarray):
        [ny, nx] = board.shape
        pos_list: List[tuple[int, int]] = []
        for k in range(ny):
            for l in range(nx):
                if board[k, l] == 0:
                    pos_list.append((l, k))

        return pos_list

    def tester(self, config: GameConfig) -> bool:
        return np.all(config.row_status == 1) and np.all(config.col_status == 1)

    def get_minimax(
        self,
        config: GameConfig,
        chosen_depth: int = 0,
        max_depth: int = 0,
        alpha_value: float = -np.inf,
        beta_value: float = np.inf,
    ) -> float:
        if time() >= self.global_counter:
            raise TimeoutError()
        if self.tester(config) or chosen_depth == max_depth:
            return self.get_utility(config)
        if self.is_player == config.player1_turn:
            result_value = -np.inf
            moves = self.create_actions(config)
            for move in moves:
                result_value = max(
                    result_value,
                    self.get_minimax(
                        self.get_result(config, move),
                        chosen_depth=chosen_depth + 1,
                        max_depth=max_depth,
                        alpha_value=alpha_value,
                        beta_value=beta_value
                    ),
                )
                alpha_value = max(alpha_value, result_value)
                if beta_value <= alpha_value:
                    break
            return result_value
        else:
            result_value = np.inf
            moves = self.create_actions(config)
            for move in moves:
                result_value = min(
                    result_value,
                    self.get_minimax(
                        self.get_result(config, move),
                        chosen_depth=chosen_depth + 1,
                        max_depth=max_depth,
                        alpha_value=alpha_value,
                        beta_value=beta_value
                    ),
                )
                beta_value = min(beta_value, result_value)
                if beta_value <= alpha_value:
                    break
            return result_value

    def add_to_chain(self, config: GameConfig, chains: List[List[int]], square_num):
        next_square_num = [square_num - 1, square_num - 3, square_num + 1, square_num + 3]
        for index in range(len(next_square_num)):
            if (
                next_square_num[index] < 0
                or next_square_num[index] > 8
                or (index % 2 == 0 and next_square_num[index] // 3 != square_num // 3)
            ):
                continue
            result_flag = False
            for chain in chains:
                if next_square_num[index] in chain:
                    result_flag = True
                    break

            if not result_flag and index % 2 == 0:
                temp_val = max(square_num, next_square_num[index])
                if not config.col_status[temp_val // 3][temp_val % 3]:
                    chains[-1].append(next_square_num[index])
                    self.add_to_chain(config, chains, next_square_num[index])

            if not result_flag and index % 2 != 0:
                temp_val = max(square_num, next_square_num[index])
                if not config.row_status[temp_val // 3][temp_val % 3]:
                    chains[-1].append(next_square_num[index])
                    self.add_to_chain(config, chains, next_square_num[index])

    def get_chain_count(self, config: GameConfig) -> int:
        chain_count_value = 0
        chains: List[List[int]] = []
        for square_num in range(9):
            result_flag = False
            for chain in chains:
                if square_num in chain:
                    result_flag = True
                    break
            if not result_flag:
                chains.append([square_num])
                self.add_to_chain(config, chains, square_num)
        for chain in chains:
            if len(chain) >= 3:
                chain_count_value += 1
        return chain_count_value

    def get_utility(self, config: GameConfig) -> float:
        [ny, nx] = config.board_status.shape
        utility_value = 0
        square_won = 0
        square_lost = 0
        for k in range(ny):
            for l in range(nx):
                if self.is_player:
                    if config.board_status[k, l] == -4:
                        utility_value += 1
                        square_won += 1
                    elif config.board_status[k, l] == 4:
                        utility_value -= 1
                        square_lost += 1
                else:
                    if config.board_status[k, l] == -4:
                        utility_value -= 1
                        square_lost += 1
                    elif config.board_status[k, l] == 4:
                        utility_value += 1
                        square_won += 1

        if self.get_chain_count(config) % 2 == 0 and self.is_player:
            utility_value += 1
        elif self.get_chain_count(config) % 2 != 0 and not self.is_player:
            utility_value += 1

        if square_won >= 5:
            utility_value = np.inf
        elif square_lost >= 5:
            utility_value = -np.inf
        return utility_value

