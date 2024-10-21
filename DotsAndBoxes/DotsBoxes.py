from GameConfig import GameConfig
from MinMaxPlayer import MinMaxPlayer
import numpy as np

class DotsBoxes:
    def __init__(self, number_of_dots):
        self.total_dots = number_of_dots
        self.ai_player =  MinMaxPlayer()
        self.board_config = np.zeros(
            shape=(self.total_dots - 1, self.total_dots - 1))
        self.row_values = np.zeros(shape=(self.total_dots, self.total_dots - 1))
        self.col_values = np.zeros(shape=(self.total_dots - 1, self.total_dots))
        self.player_turn = True
        self.isSquareCompleted = False

    def is_occupied(self, coordinates, move_dir):
        x = coordinates[0]
        y = coordinates[1]
        isOccupied = True
        if move_dir == "row" and self.row_values[y][x] == 0:
            isOccupied = False
        if move_dir == "col" and self.col_values[y][x] == 0:
            isOccupied = False
        return isOccupied


    def is_gameover(self):
        return (self.row_values == 1).all() and (self.col_values == 1).all()

    def isCompleted(self):
        self.isSquareCompleted = True

    def update_config(self, move_dir, coordinates):
        xPos = coordinates[0]
        yPos = coordinates[1]
        result_value = 1
        modifier_value = 1
        if self.player_turn:
            modifier_value = -1
        if yPos < (self.total_dots - 1) and xPos < (self.total_dots - 1):
            self.board_config[yPos][xPos] = (
                                              abs(self.board_config[yPos][xPos]) + result_value
            ) * modifier_value
            if abs(self.board_config[yPos][xPos]) == 4:
                self.isCompleted()
        if move_dir == "row":
            self.row_values[yPos][xPos] = 1
            if yPos >= 1:
                self.board_config[yPos - 1][xPos] = (
                                                      abs(self.board_config[yPos - 1][xPos]) + result_value
                ) * modifier_value
                if abs(self.board_config[yPos - 1][xPos]) == 4:
                    self.isCompleted()
        elif move_dir == "col":
            self.col_values[yPos][xPos] = 1
            if xPos >= 1:
                self.board_config[yPos][xPos - 1] = (
                                                      abs(self.board_config[yPos][xPos - 1]) + result_value
                ) * modifier_value
                if abs(self.board_config[yPos][xPos - 1]) == 4:
                    self.isCompleted()

    def printBoard(self):
        print("Printing the board \n")
        print(self.row_values)
        print(self.col_values)
        print("============================================")

    def player_move(self, move_dir, coordinates):
        print("Player move:")
        self.update(move_dir, coordinates)

    def update(self, move_dir, cordinates):
        if move_dir and not self.is_occupied(cordinates, move_dir):
            self.update_config(move_dir, cordinates)
            self.player_turn = (
                not self.player_turn if not self.isSquareCompleted else self.player_turn
            )
            self.isSquareCompleted = False
            self.printBoard()

    def computer_move(self):
        print ("Computer move:")
        move = self.ai_player.get_action(
            GameConfig(
                self.board_config.copy(),
                self.row_values.copy(),
                self.col_values.copy(),
                self.player_turn,
            )
        )
        self.update(move.action_type, move.position)
        return move

