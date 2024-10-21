from flask import Flask, render_template, request, redirect, url_for, session
from datetime import datetime, timedelta
from DotsBoxes import DotsBoxes
from GameMove import GameMove

app = Flask(__name__)
app.secret_key = "secret key"
TOTAL_DOTS = 7
game_instance = DotsBoxes(7)

@app.route('/')
def index():
    #session['game_instance'] = game_instance1.__dict__
    return render_template("index.html")

@app.route('/game', methods=['POST'])
def game():
    size = request.form.get("board_size")  # retrieve the data sent from JavaScript
    print("Game html called:" + str(size))
    global game_instance
    global TOTAL_DOTS
    TOTAL_DOTS = int(size)
    print("SET SIZE TO:" + str(TOTAL_DOTS))
    game_instance = DotsBoxes(TOTAL_DOTS)
    return render_template("game.html")


@app.route('/getSize', methods=['POST'])
def getSize():
    global TOTAL_DOTS
    print("Get size called ...." + str(TOTAL_DOTS))
    return str(TOTAL_DOTS)

@app.route("/player_move",methods=['POST'])
def player_move():
    print("Calling player move.................")
    data = request.get_json()  # retrieve the data sent from JavaScript
    # process the data using Python code
    player_link = data['link']
    print(player_link)
    coords = player_link.split(",")
    x1 = int(coords[0])
    y1 = int(coords[1])
    x2 = int(coords[2])
    y2 = int(coords[3])

    #game_instance = session ['game_instance']
    if x1 != x2:
        print("Row Wise:")
        type = "row"
        position = [x1,y1]
        game_instance.player_move(type, position)
        return ""
    else:
        print("column Wise:")
        type = "col"
        position = [x1,y1]
        game_instance.player_move(type, position)
        return ""



@app.route("/computer_move",methods=['POST'])
def computer_move():
    print("Calling computer move.................")
    action = game_instance.computer_move()
    x = int(action.position[0])
    y = int(action.position[1])
    if action.action_type == "row":
        comp_link = str(x) + "," + str(y) + "," + str(x+1) + "," + str(y)
        return comp_link
    else:
        comp_link = str(x) + "," + str(y) + "," + str(x) + "," + str(y+1)
        return comp_link


@app.route("/init_game",methods=['POST'])
def init_game():
    global game_instance
    global TOTAL_DOTS
    print("Calling init game.................")
    game_instance = DotsBoxes(TOTAL_DOTS)
    return ""


@app.route("/is_gameOver",methods=['POST'])
def is_gameOver():
    print("Calling game over.................")
    result = game_instance.is_gameover()
    if result:
        return "true"
    else:
        return "false"


if __name__ == '__main__':
    app.run()
