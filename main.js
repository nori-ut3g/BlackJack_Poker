/*
ブラックジャックルール
https://recursionist.io/dashboard/course/19/lesson/432
参照


ポーカールール
目的：他のプレーヤーより良い役をつくる

役の種類：
https://www.nintendo.co.jp/others/playing_cards/howtoplay/poker/index.html
参照

ルール：
1ゲームの参加費は100。
親(Dealer)は1ゲームごと交代する。
親の隣の人から行動する。

１．bettingフェーズ１回目
最初の人は「ベット」か「チェック」が宣言できる。
「ベット」はチップから任意の額を賭けること。
「チェック」はそのゲームから降りること（参加費はとられる）。
一度誰かが「ビッド」を宣言したら、「チェック」はできない。

その後は「コール」「レイズ」「ドロップ」が宣言できる。
「コール」は前の人と同じ額を賭けること。
「レイズ」は前の人より高い額を賭けること。
「ドロップ」は今自分が賭けている額を捨て、そのゲームから降りること。
全員が同じ額を賭けるまでフェーズが続く。

2.exhangeフェーズ
親の隣のプレーヤーから行動する。
役を狙ってカードを交換する。

3.bettingフェーズ2
親の隣のプレーヤーから行動する。
bettingフェーズ１回目と同じだが、最初から「コール」「レイズ」「ドロップ」しか宣言できない。
全員が同じ額を賭けるまでフェーズが続く。

4.evaluateフェーズ
カードを表にし、一番強い役を持ったプレーヤーの勝ち。
そのゲームで賭けたチップをすべて獲得する。
役が同じ場合は役のrank、さらに同じであればその他のカードのrankで勝敗を決める。
全部同じ場合はdrawとなる。
このフェーズで所有するchipがマイナスになった場合負け、次のゲームから参加できなくなる。
カードを配りなおし、bettingフェーズ１回目に戻る。

最終的に残った人が勝ち。

------コードの解説--------
class Render:フロントエンドで表示する

class LinkedList:プレーヤー同士をつなげる
class card:トランプカード、裏表、suitとrankなど
class Deck:デッキ
class Player:プレーヤーの行動
class Table:ゲームの状況
class RandomChoiceTools:NPCの行動で主に使用

・ゲームの進行
ゲームのフェーズに沿ってclassTableのgamePhaseが変化し、ゲームが進む。
フェーズ内ではplayerが行動終わったら、次のプレーヤーに進む。
プレーヤーは環状のLinkedListでつながっている。
プレーヤーが負けた場合はLinkedListから抜ける。
親はheadで、現在のプレーヤーはiteratorPlayerで、tableのクラスで管理した。

・NPCの行動
ポーカーの手札の交換
exchangeフェーズの時、役を作るためにモンテカルロ法のような方法で決めた。
交換の方法は、例えば[2S,2H,3H,5H,3D]が手札とし、1を交換する[00010]のようなマスクをつくり、フルハウスを狙うようにした。
モンテカルロ法はランダムに何度も行動し（今回は1000回くらい）、統計的に一番いい結果をのこす行動を選ぶような方法。
実際には、手札の除いたデッキを作り、ランダムにマスクを作り、何度も交換して強い役が作れそうなマスクを決定した。
なお、役の強さは役が出る確率の逆数にして、その合計値を計算した。
※ストレートを狙うかペア系の期待値を一緒に計算するとどっちつかずのこたえになるので、分けた。
詳細はpokerExchangeCardMaskCalc()

・ポーカーの行動の計算
行動はplayerクラスのactionProbabilityで管理した。
map{選択A:0.5, 選択B:0.1 ...}で管理することにより、状況に応じてplayerの行動の確率をきめることができる。
実際に行動を決定するときは、valriableRandomChoice(choicesRateList)を使用する。
valriableRandomChoiceは、choicesRateListから決まった確率でランダムで選ぶ関数。
※確率の合計が1にならなくても良い


*/
class Render{
    //mainPage
    static gameSelectPage(){
        let gameDiv = document.getElementById("gameDiv");
        gameDiv.innerHTML = `
            <div>
                <p class="text-white" > Welcome to Card Game! </p>
                <div>
                    <input id="user-name" type="text" placeholder="name">
                </div>
                <div>
                    <select id="game-type">
                        <option value="Poker">Poker</option>
                        <option value="BlackJack">Blackjack</option>
                    </select>
                </div>
                <div>
                <a id = "start-game" class="btn btn-success">Start Game </a>
                </div>
            </div>
            `
        let gameType = document.getElementById("game-type");
        let userName = document.getElementById("user-name");
        let startGameBtn = document.getElementById("start-game");
        startGameBtn.addEventListener("click", function(){
            console.log("startGameBtn");
            Render.gamePage(gameType.value,userName.value);
        });
    }
    static gamePage(gameType, userName){
        if(gameType == "BlackJack"){
            let table = new Table(gameType,userName);
            this.reflesh(table);
            this.blackJackRenderTable(table);
        }else if(gameType == "Poker"){
            let table = new Table(gameType,userName);
            this.reflesh(table);
            this.pokerRenderTable(table);
        }else{
            console.log("gamePage error");
        }
    }
    static gameEndPage(table){
        let gameDiv = document.getElementById("gameDiv");
        gameDiv.innerHTML = "";
        let gameEndPageDiv = document.createElement("div");
        gameEndPageDiv.classList.add("col-7","bg-dark","item-box","flex-column");
        if (table.iteratorOfPlayer.type == "user"){
            gameEndPageDiv.innerHTML = `
                <br>
                <div class="font-weight-bold">
                    <p>Congratulations!! Winner is ${table.iteratorOfPlayer.name}.</p>
                </div>`
        }else{
            gameEndPageDiv.innerHTML = `
                <div class="font-weight-bold">
                    <p>You lose. Winner is ${table.iteratorOfPlayer.name}.</p>
                </div>`;
        }
        gameEndPageDiv.innerHTML  +=  this.createBtn("return", "btn-light", "text-dark");
        gameDiv.append(gameEndPageDiv);
        let returnBtn = document.getElementById("return-btn");
        returnBtn.addEventListener("click", function(){
            console.log("returnBtn");
            gameDiv.innerHTML = "";
            return Render.gameSelectPage()
        });
    }
    static blackJackRenderTable(table){
        let i = 0;
        if(table.iteratorOfPlayer.type == "user"){
            this.reflesh(table);
            this.addEventDivUserBtn(table);
            return;
        }else if(table.gamePhase == "GameEnd"){
            return this.gameEndPage(table)
        }else if(table.gamePhase == "start"){
            i = 0;
            this.reflesh(table);
            this.addEventDivUserBtn(table);
            return;
        }else if(table.gamePhase == "evaluate"){
            i = 0;
            this.reflesh(table);
            this.addEventDivUserBtn(table);
            return;
        }else{
            if(i > 100){
                console.log("blackJackRenderTable error");
                return;
            }
            i++;
            this.reflesh(table);
            table.haveTurn();
            setTimeout(function () {
                return Render.blackJackRenderTable(table);
            }, 10);
        }

    }
    static pokerRenderTable(table){
        let i = 0;
        if(table.gamePhase == "showdown"){
            i = 0;
            this.reflesh(table);
            this.addEventDivUserBtn(table);
            return;
        }else if(table.gamePhase == "evaluate"){
            i = 0;
            this.reflesh(table);
            this.addEventDivUserBtn(table);
            return;
        }else if(table.gamePhase == "start"){
            i = 0;
            this.reflesh(table);
            this.addEventDivUserBtn(table);
            return;
        }else if(table.gamePhase == "GameEnd"){
            return this.gameEndPage(table);
        }else if(table.iteratorOfPlayer.type == "user"){
            this.reflesh(table);
            this.addEventDivUserBtn(table);
            if(table.gamePhase == "exchange") this.tuningIntoButton(table.iteratorOfPlayer.name, table);
            return;
        }else{
            if(i > 100){
                console.log("pokerRenderTable error");
                return;
            }
            i++;
            this.reflesh(table);
            table.haveTurn();
            setTimeout(function () {
                return Render.pokerRenderTable(table);
            }, 1000);
        }

    }

    //画面更新
    static reflesh(table){
        let gameDiv = document.getElementById("gameDiv");
        gameDiv.innerHTML = "";
        gameDiv.append(this.tablePage(table));
    }
    static tablePage(table){
        let allPlayersDiv = document.createElement("div");
        allPlayersDiv.classList.add("col-12");
        if(table.gameType == "BlackJack"){
            allPlayersDiv.append(this.divUpperTable(table));
            allPlayersDiv.append(this.divLowerTable(table));
            if(table.iteratorOfPlayer.type == "user" || table.gamePhase == "start" || table.gamePhase == "evaluate"){
                allPlayersDiv.append(this.divUserBtn(table));
            }
        }else if(table.gameType == "Poker"){
            allPlayersDiv.append(this.divUpperTable(table));
            allPlayersDiv.append(this.divMiddleTable(table));
            allPlayersDiv.append(this.divLowerTable(table));
            if(table.iteratorOfPlayer.type == "user" || table.gamePhase == "start" || table.gamePhase == "showdown" || table.gamePhase == "evaluate" ){
                allPlayersDiv.append(this.divUserBtn(table));
            }
        }
        return allPlayersDiv;
    }

    //子要素
    static divTableInfo(table){
        let tableInfo = document.createElement("div");
        let deckDiv = document.createElement("div");
        let information = document.createElement("p");
        tableInfo.classList.add("col-3", "m-auto", "text-white");
        deckDiv.classList.add("text-center");
        if(table.gamePhase =="evaluate"){
            information.innerHTML = `
            <div>
                <h4>${table.turnWinnerPlayer.name} wins with The ${table.turnWinnerPlayer.handEvalution[0]}!</h4>
            </div>
            <div>
                <h4>${table.turnWinnerPlayer.name} gets ${table.totalBet}!</h4>
            </div>
            `
        }else{
            information.innerHTML = `
            <div>
                <h5>Dealer:${table.playersLinkedList.head.name}</h5>

            </div>
            <div>
                <h5>TurnPlayer:${table.iteratorOfPlayer.name}</h5>
            </div>
            <div>
                <h5>MaxBet:${table.maxBet}</h5>
                <h5>TotalBet:${table.totalBet}</h5>
            </div>
            `
        }
        deckDiv.append(information);
        tableInfo.append(deckDiv);
        return tableInfo;
    }
    static divUpperTable(table){
        let upperTable = document.createElement("div");
        upperTable.classList.add("p-3");
        if(table.gameType == "BlackJack"){
            upperTable.append(this.divPlayer(table.players[0],"",table));
        }else if(table.gameType == "Poker"){
            upperTable.append(this.divPlayer(table.players[0],"reverse",table));
        }
        return upperTable;
    }
    static divMiddleTable(table){
        let middleTable = document.createElement("div");
        middleTable.classList.add("row", "p-3");
        middleTable.append(this.divPlayer(table.players[1],"right",table));
        middleTable.append(this.divTableInfo(table));
        middleTable.append(this.divPlayer(table.players[3],"left",table));
        return middleTable;
    }
    static divLowerTable(table){
        let lowerTable = document.createElement("div");
        lowerTable.classList.add("row","p-3");
        if(table.gameType == "BlackJack"){
            lowerTable.append(this.divPlayer(table.players[1],"",table));
            lowerTable.append(this.divPlayer(table.players[2],"",table));
            lowerTable.append(this.divPlayer(table.players[3],"",table));
        }else if(table.gameType == "Poker"){
            lowerTable.append(this.divPlayer(table.players[2],"",table));
        }
        return lowerTable;
    }
    static divCards(card,cardDirection, name, i, table){
        let amIcheater = table.players[2].name == "cheater";
        let cardDiv = document.createElement("div");
        let imgDiv = document.createElement("div");
        let img = document.createElement("img");
        let valueDiv = document.createElement("div");
        let valueP = document.createElement("p");
        const suitImgUrlList = {
            "H":"https://recursionist.io/img/dashboard/lessons/projects/heart.png",
            "D":"https://recursionist.io/img/dashboard/lessons/projects/diamond.png",
            "C":"https://recursionist.io/img/dashboard/lessons/projects/clover.png",
            "S":"https://recursionist.io/img/dashboard/lessons/projects/spade.png",
            "B":"https://cdn.pixabay.com/photo/2018/09/12/09/04/wall-3671612_640.jpg"
        }
        let valueDirectionClass;
        switch (cardDirection) {
            case "right":
                valueDirectionClass = "transform-left-rotate";
                break;
            case "left":
                valueDirectionClass = "transform-right-rotate";
                break;
            case "reverse":
                valueDirectionClass = "transform-reverse-rotate";
                break;
            default:
                valueDirectionClass = "transform-no-rotate";
                break;
        }
        cardDiv.id = `${name}-${i}-card-div`;
        if(card.cardStatus || amIcheater){
            cardDiv.classList.add("bg-white", "border", "card-shape", "m-auto");
            imgDiv.classList.add("text-center");
            img = document.createElement("img");
            img.src = `${suitImgUrlList[card.suit]}`;
            img.style.width="50px";
            img.style.height="50px";
            imgDiv.append(img);
            cardDiv.append(imgDiv);
            valueDiv.classList.add("m-0", "text-center", "font-weight-bold",valueDirectionClass);
            valueP.textContent = card.rank;
            valueP.classList.add("text-dark");
            valueDiv.append(valueP);
            cardDiv.append(valueDiv);
        }else{
            cardDiv.classList.add("bg-white", "border", "card-shape", "row", "m-auto");
            imgDiv.classList.add("m-auto");
            img = document.createElement("img");
            img.classList.add("card-texture-shape","card-texture-shape");
            img.src =  `${suitImgUrlList["B"]}`;
            imgDiv.append(img);
            cardDiv.append(imgDiv);
        }
        if(card.isSelected){
            cardDiv.classList.add("btn-selected");
        }else{
            cardDiv.classList.add("btn-not-selected");
        }
        return cardDiv;
    }
    static divPlayer(player,playerDirection, table){
        let playerDiv = document.createElement("div");
        let playerInfoDiv = document.createElement("div");
        let playerInfoP = document.createElement("p");
        let playerCardsDiv = document.createElement("div");
        let playerNameP = document.createElement("p");
        let playerDirectionClass;
        let textDirectionClass;
        switch(playerDirection){
            case "right":
                playerDirectionClass = "transform-right-rotate";
                textDirectionClass = "transform-left-rotate";
                break;
            case "left":
                playerDirectionClass = "transform-left-rotate";
                textDirectionClass = "transform-right-rotate";
                break;
            case "reverse":
                playerDirectionClass = "transform-reverse-rotate";
                textDirectionClass = "transform-reverse-rotate";
                break;
            default:
                playerDirectionClass = "transform-no-rotate";
                textDirectionClass = "transform-no-rotate";
                break;
        }
        playerDiv.id = `${player.name}-player-div`;
        playerDiv.classList.add("col-3", playerDirectionClass, "m-auto");
        playerInfoDiv.classList.add("mx-5", textDirectionClass, "text-white", "text-center", "rem3");
        playerInfoP.classList.add("rem1", "text-center");
        playerCardsDiv.classList.add("d-flex", "justify-content-center", "text-dark");
        playerNameP.classList.add("m-0", "text-white", "text-center", "h4");
        playerNameP.textContent = player.name;
        playerInfoDiv.append(playerNameP);
        if(table.gameType == "BlackJack"){
            if(player.type != "house"){
                if(table.gamePhase == "start"){
                    playerInfoP.innerHTML = `
                        <div>
                            <h5>${player.status}</h5>
                        </div>
                        <div>
                            <h5>Bet: ${player.bet}</h5>
                        </div>
                        <div>
                            <h5>Chips: ${player.chips}</h5>
                        </div>`;
                }else{
                    playerInfoP.innerHTML = `
                        <div>
                            <h5>${player.action}</h5>
                        </div>
                        <div>
                            <h5>Bet: ${player.bet}</h5>
                        </div>
                        <div>
                            <h5>Chips: ${player.chips}</h5>
                        </div>`;
                }
            }
        }else if(table.gameType == "Poker"){
            playerInfoP.innerHTML = `
                        <div>
                            <h5>Status:${player.status}</h5>
                        </div>
                        <div>
                            <h5>Action:${player.action}</h5>
                        </div>
                        <div>
                            <h5>Bet: ${player.bet}</h5>
                        </div>
                        <div>
                            <h5>Chips: ${player.chips}</h5>
                        </div>`;
        }
        playerInfoDiv.append(playerInfoP);
        playerDiv.append(playerInfoDiv);
        for(let i = 0;i < player.hand.length; i++){
            playerCardsDiv.append(this.divCards(player.hand[i], "",player.name, i, table));
        }
        playerDiv.append(playerCardsDiv);
        return playerDiv;
    }
    static divUserBtn(table){
        let actionsAndBetsDiv = document.createElement("div");
        actionsAndBetsDiv.classList.add("d-flex", "pb-5", "pt-4", "justify-content-center");
        let actionBtnDiv = document.createElement("div");
        actionBtnDiv.classList.add("d-flex", "flex-wrap", "w-70");
        let betBtnDiv = document.createElement("div");
        betBtnDiv.classList.add("d-flex", "flex-wrap", "w-70");
        if(table.gameType == "BlackJack"){
            if(table.gamePhase == "start"){
                actionBtnDiv.innerHTML  = this.createBtn("start", "btn-light", "text-dark");
            }else if(table.gamePhase == "betting"){
                actionBtnDiv.innerHTML  = this.createBtn("bet", "btn-light", "text-dark");
                betBtnDiv.innerHTML = `
                    <div class = "container">
                        <div class="input-group" >
                            <span class="input-group-btn">
                                <button id = "minus-btn" type="button" class="btn btn-success btn-number">
                                    -
                                </button>
                            </span>
                            <input id = "bet-input" type="text" class="input-number text-center" size="2" maxlength="5" value="0">
                            <span class="input-group-btn">
                                <button id = "plus-btn" type="button" class="btn btn-danger btn-number">
                                    +
                                </button>
                            </span>
                        </div><!--end input group div -->
                    </div> <!-- end betChoiceDiv -->

                `
            }else if(table.gamePhase == "acting"){
                actionBtnDiv.innerHTML  = this.createBtn("stand", "btn-success", "text-white")
                    + this.createBtn("hit", "btn-light","text-dark")
                    + this.createBtn("double", "btn-danger","text-dark")
                    + this.createBtn("surrender", "btn-dark","text-white");
            }else if(table.gamePhase == "evaluate"){
                actionBtnDiv.innerHTML  = this.createBtn("evaluate", "btn-light", "text-dark")
            }
        }else if(table.gameType == "Poker"){
            if(table.noOneBet && table.gamePhase == "betting1"){
                actionBtnDiv.innerHTML  = this.createBtn("bet", "btn-light", "text-dark")
                    + this.createBtn("check", "btn-success", "text-dark");
                betBtnDiv.innerHTML = `
                    <div class = "container">
                        <div class="input-group" >
                            <span class="input-group-btn">
                                <button id = "minus-btn" type="button" class="btn btn-success btn-number">
                                    -
                                </button>
                            </span>
                            <input id = "bet-input" type="text" class="input-number text-center" size="2" maxlength="5" value="0">
                            <span class="input-group-btn">
                                <button id = "plus-btn" type="button" class="btn btn-danger btn-number">
                                    +
                                </button>
                            </span>

                        </div><!--end input group div -->
                    </div> <!-- end betChoiceDiv -->

                `
            }else if(table.gamePhase == "betting1" || table.gamePhase == "betting2"){
                actionBtnDiv.innerHTML  = this.createBtn("call", "btn-light", "text-dark")
                    + this.createBtn("raise", "btn-danger", "text-dark")
                    + this.createBtn("drop", "btn-dark", "text-white");
                betBtnDiv.innerHTML = `
                    <div class = "container">
                        <div class="input-group" >
                            <span class="input-group-btn">
                                <button id = "minus-btn" type="button" class="btn btn-success btn-number">
                                    -
                                </button>
                            </span>
                            <input id = "bet-input" type="text" class="input-number text-center" size="2" maxlength="5" value="0">
                            <span class="input-group-btn">
                                <button id = "plus-btn" type="button" class="btn btn-danger btn-number">
                                    +
                                </button>
                            </span>

                        </div><!--end input group div -->
                    </div> <!-- end betChoiceDiv -->
                            `
            }else if(table.gamePhase == "exchange" ){
                actionBtnDiv.innerHTML  = this.createBtn("exchange", "btn-light", "text-dark");
            }else if(table.gamePhase == "showdown" ){
                actionBtnDiv.innerHTML  = this.createBtn("showdown", "btn-light", "text-dark");
            }else if(table.gamePhase == "evaluate" ){
                actionBtnDiv.innerHTML  = this.createBtn("next", "btn-light", "text-dark");
            }else if(table.gamePhase == "start" ){
                actionBtnDiv.innerHTML  = this.createBtn("start", "btn-light", "text-dark");
            }else{
                console.log("divUserBtn Error table.gamePhase is",table.gamePhase);
            }
        }
        actionsAndBetsDiv.append(actionBtnDiv);
        actionsAndBetsDiv.append(betBtnDiv);
        return actionsAndBetsDiv;
    }
    static createBtn(type, btncolor, textcolor){
        let innerHTML =  `
            <div class="py-2">
                <a id = "${type}-btn" class="${btncolor} btn ${textcolor} px-5 py-1">${type}</a>
            </div>
            `
        return innerHTML;
    }
    static tuningIntoButton(name, table){
        for(let i = 0; i < table.players[2].hand.length; i++){
            let catdDivBtn = document.getElementById(`${name}-${i}-card-div`);
            catdDivBtn.addEventListener("click", function(){
                table.players[2].hand[i].isSelected = !table.players[2].hand[i].isSelected;
                if(table.players[2].hand[i].isSelected){
                    catdDivBtn.classList.remove("btn-not-selected");
                    catdDivBtn.classList.add("btn-selected");
                }else{
                    catdDivBtn.classList.remove("btn-selected");
                    catdDivBtn.classList.add("btn-not-selected");
                }
            })
        }
    }
    static addEventDivUserBtn(table){
        if(table.gameType == "BlackJack"){
            if(table.gamePhase == "start"){
                let startBtn = document.getElementById("start-btn");
                startBtn.addEventListener("click", function(){
                    console.log("startBtn");
                    table.haveTurn();
                    if(table.players[2].status == "bust"){
                        return Render.gameEndPage(table);
                    }else{
                        table.gamePhase = "betting";
                    }
                    Render.blackJackRenderTable(table);
                });
            }else if(table.gamePhase == "betting"){
                let betBtn = document.getElementById("bet-btn");
                let plusBtn = document.getElementById("plus-btn");
                let minusBtn = document.getElementById("minus-btn");
                let betInput = document.getElementById("bet-input");
                let planToBet = 0;
                let maxBet = table.iteratorOfPlayer.chips;
                betInput.value = planToBet;
                betBtn.addEventListener("click", function(){
                    console.log("betBtn");
                    table.iteratorOfPlayer.action = "bet";
                    table.iteratorOfPlayer.bet = planToBet;
                    table.haveTurn();
                    Render.blackJackRenderTable(table);
                });
                plusBtn.addEventListener("click", function(){
                    console.log("plusBtn");
                    planToBet >= maxBet ? planToBet = maxBet : planToBet += 20;
                    betInput.value = planToBet;
                });
                minusBtn.addEventListener("click", function(){
                    console.log("minusBtn")
                    planToBet <= 0 ? planToBet = 0 : planToBet -= 20;
                    betInput.value = planToBet;
                });
            }else if(table.gamePhase == "acting"){
                let standBtn = document.getElementById("stand-btn");
                let hitBtn = document.getElementById("hit-btn");
                let doubleBtn = document.getElementById("double-btn");
                let surrenderBtn = document.getElementById("surrender-btn");
                if (table.iteratorOfPlayer.bet > table.iteratorOfPlayer.chips){
                    doubleBtn.classList.add("disabled");
                }
                standBtn.addEventListener("click", function(){
                    console.log("standBtn");
                    table.iteratorOfPlayer.action = "stand";
                    table.haveTurn();
                    Render.blackJackRenderTable(table);
                });
                hitBtn.addEventListener("click", function(){
                    console.log("hitBtn");
                    table.iteratorOfPlayer.action = "hit";
                    table.haveTurn();
                    Render.blackJackRenderTable(table);
                });
                doubleBtn.addEventListener("click", function(){
                    console.log("doubleBtn");
                    table.iteratorOfPlayer.action = "double";
                    table.haveTurn();
                    Render.blackJackRenderTable(table);
                });
                surrenderBtn.addEventListener("click", function(){
                    console.log("surrenderBtn");
                    table.iteratorOfPlayer.action = "surrender";
                    table.haveTurn();
                    Render.blackJackRenderTable(table);
                });
            }else if(table.gamePhase == "evaluate"){
                let evaluateBtn = document.getElementById("evaluate-btn");
                evaluateBtn.addEventListener("click", function(){
                    console.log("evaluateBtn");
                    table.iteratorOfPlayer.action = "evaluate";
                    table.haveTurn();
                    Render.blackJackRenderTable(table);
                });
            }
        }else if(table.gameType == "Poker"){
            if(table.gamePhase == "start" ){
                let startBtn = document.getElementById("start-btn");
                startBtn.addEventListener("click", function(){
                    console.log("startBtn");
                    table.haveTurn();
                    table.gamePhase = "betting1";
                    Render.pokerRenderTable(table);
                });
            }else if(table.noOneBet && table.gamePhase == "betting1"){
                let betBtn = document.getElementById("bet-btn");
                let checkBtn = document.getElementById("check-btn");
                let plusBtn = document.getElementById("plus-btn");
                let minusBtn = document.getElementById("minus-btn");
                let betInput = document.getElementById("bet-input");
                let planToBet = table.maxBet - table.iteratorOfPlayer.bet;
                betInput.value = planToBet;
                betBtn.addEventListener("click", function(){
                    console.log("betBtn");
                    if(betInput.value == 0){
                        alert("check?");
                        return;
                    }
                    table.iteratorOfPlayer.action = "bet";
                    table.iteratorOfPlayer.planToBet = planToBet;
                    table.haveTurn();
                    Render.pokerRenderTable(table);
                });
                checkBtn.addEventListener("click", function(){
                    console.log("checkBtn");
                    if(betInput.value > 0){
                        alert("bet?");
                        return;
                    }
                    table.iteratorOfPlayer.action = "check";
                    table.haveTurn();
                    Render.pokerRenderTable(table);
                });
                plusBtn.addEventListener("click", function(){
                    console.log("plusBtn");
                    planToBet += 10;
                    betInput.value = planToBet;
                });
                minusBtn.addEventListener("click", function(){
                    console.log("minusBtn");
                    planToBet <= 0 ? planToBet = 0 : planToBet -= 10;
                    betInput.value = planToBet;
                });
            }else if(table.gamePhase == "betting1" || table.gamePhase == "betting2"){
                let callBtn = document.getElementById("call-btn");
                let raiseBtn = document.getElementById("raise-btn");
                let dropBtn = document.getElementById("drop-btn");
                let plusBtn = document.getElementById("plus-btn");
                let minusBtn = document.getElementById("minus-btn");
                let betInput = document.getElementById("bet-input");
                let planToBet = table.maxBet - table.iteratorOfPlayer.bet;
                betInput.value = planToBet;
                callBtn.addEventListener("click", function(){
                    console.log("callBtn");
                    if(betInput.value > table.maxBet - table.iteratorOfPlayer.bet){
                        alert("raise?");
                        return;
                    }
                    table.iteratorOfPlayer.action = "call";
                    table.iteratorOfPlayer.planToBet = planToBet;
                    table.haveTurn();
                    Render.pokerRenderTable(table);
                });
                raiseBtn.addEventListener("click", function(){
                    console.log("raiseBtn");
                    if(betInput.value == table.maxBet - table.iteratorOfPlayer.bet ){
                        alert("call?");
                        return;
                    }
                    table.iteratorOfPlayer.action = "raise";
                    table.iteratorOfPlayer.planToBet = planToBet;
                    table.haveTurn();
                    Render.pokerRenderTable(table);
                });
                dropBtn.addEventListener("click", function(){
                    console.log("dropBtn")
                    table.iteratorOfPlayer.action = "drop";
                    table.haveTurn();
                    Render.pokerRenderTable(table);
                });
                plusBtn.addEventListener("click", function(){
                    console.log("plusBtn");
                    planToBet += 10;
                    betInput.value = planToBet;
                });
                minusBtn.addEventListener("click", function(){
                    console.log("minusBtn");
                    planToBet <= table.maxBet - table.iteratorOfPlayer.bet  ? planToBet = table.maxBet - table.iteratorOfPlayer.bet  : planToBet -= 10;
                    betInput.value = planToBet;
                });
            }else if(table.gamePhase == "exchange" ){
                let exchangeBtn = document.getElementById("exchange-btn");
                exchangeBtn.addEventListener("click", function(){
                    console.log("exchangeBtn");
                    table.iteratorOfPlayer.action = "exchange";
                    table.haveTurn();
                    Render.pokerRenderTable(table);
                });
            }else if(table.gamePhase == "showdown" ){
                let showdownBtn = document.getElementById("showdown-btn");
                showdownBtn.addEventListener("click", function(){
                    console.log("showdownBtn");
                    table.gamePhase = "evaluate";
                    table.haveTurn();
                    Render.pokerRenderTable(table);
                });
            }else if(table.gamePhase == "evaluate" ){
                let nextBtn = document.getElementById("next-btn");
                nextBtn.addEventListener("click", function(){
                    console.log("nextBtn");
                    if(table.iteratorOfPlayer.next == table.iteratorOfPlayer){
                        this.gamePhase = "GameEnd";
                        Render.gameEndPage(table);
                    }else{
                        table.gamePhase = "start";
                        table.haveTurn();
                        table.gamePhase = "betting1";
                        Render.pokerRenderTable(table);
                    }

                });
            }else{
                console.log("addEventDivUserBtn Error table.gamePhase is ", table.gamePhase);
            }
        }
    }
}

class LinkedList{
    constructor(arr){
        if(arr.length <= 0){
            this.head =  arr[0];
            return;
        }
        this.head = arr[0];
        let currentNode = this.head;
        for(let i = 1; i < arr.length; i++){
            currentNode.next = arr[i];
            currentNode = currentNode.next;
        }
        this.tail = currentNode;
        //環状にする
        this.tail.next = this.head;
    }
}

class Card {
    constructor(suit, rank, cardStatus) {
        this.suit = suit;
        this.rank = rank;
        this.cardStatus = cardStatus; //カードの裏表
        this.isSelected = false;
    }
    turnCard() {
        let temp = this.cardStatus;
        this.cardStatus = !temp;
    }
}

class Deck {
    constructor() {
        this.cards = [];
        const suits = ["H", "D", "C", "S"];
        const rank = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
        for (let i = 0; i < suits.length; i++) {
            for (let j = 0; j < rank.length; j++) {
                this.cards.push(new Card(suits[i], rank[j], false, j + 1));
            }
        }
    }
    card(i){
        return this.cards[i];
    }
    push(card){
        this.cards.push(card);
    }
    shuffle() {
        for (let i = 0; i < this.cards.length; i++) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    }
    resetDeck() {
        this.cards = []
        const suits = ["H", "D", "C", "S"];
        const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
        for (let i = 0; i < suits.length; i++) {
            for (let j = 0; j < rank.length; j++) {
                this.cards.push(new Card(suits[i], ranks[j], false, j + 1));
            }
        }
    }
    drawOne() {
        return this.cards.pop();
    }
    emptyDeck() {
        this.cards = [];
    }
    //手札を除いたデッキを作る関数
    exclusionCards(exclusionCardsList){
        let cardTmpList = exclusionCardsList.concat();
        this.cards = [];

        //手札をソートする（concatなので、実際の手札はソートされない）
        const suitsMap = {"H":0, "D":100, "C":200, "S":300};
        const ranksMap = {"A":0, "2":1, "3":2, "4":3, "5":4, "6":5, "7":6, "8":7, "9":8, "10":9, "J":10, "Q":11, "K":12};
        for(let i = 0; i < cardTmpList.length; i++){
            let minCard = new Card("S", "K", false);
            let minRank = suitsMap[minCard.suit] + ranksMap[minCard.rank];
            let index = i;
            for(let j = i; j < cardTmpList.length; j++){
                let rank = suitsMap[cardTmpList[j].suit] + ranksMap[cardTmpList[j].rank];
                if(rank <= minRank){
                    minCard = cardTmpList[i];
                    minRank = rank;
                    index = j;
                }
            }
            let tmp = cardTmpList[i];
            cardTmpList[i] = cardTmpList[index];
            cardTmpList[index] = tmp;
        }
        //手札を除いたデッキになる。
        const suits = ["H", "D", "C", "S"];
        const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
        let k = 0;
        for (let i = 0; i < suits.length; i++) {
            for (let j = 0; j < ranks.length; j++) {
                if(cardTmpList[k].suit == suits[i] && cardTmpList[k].rank == ranks[j]){
                    if(k < cardTmpList.length-1) k++;
                    continue;
                }
                this.cards.push(new Card(suits[i], ranks[j], false, j + 1));
            }
            if(k == cardTmpList.length)break;
        }
    }
}

class Player {
    constructor(name, type, gameType, chips = 1000) {
        this.name = name;
        this.type = type;
        this.gameType = gameType;
        this.chips = chips;
        this.bet = 0;
        this.planToBet = 0;//賭ける予定の額（その後のactionで変わる）
        if(this.gameType == "BlackJack"){
            this.actStatus = "betting";
            this.handEvalution = 0;
        }else if(this.gameType == "Poker"){
            this.actStatus = "betting1"
            this.amIDealer = false;
            this.handEvalution = [];
            this.decideChangeCard = false;
            this.planToExchange;
            this.turnWinnerPlayer;
            this.gameWinnerPlayer;
        }
        this.status = "start" //win lose drop check bust etc.
        this.action = null //
        this.hand = [];
        this.actionProbability = {};//tableクラスでほかのPlayerの手札をみて行動確率をきめる
        this.next = null;
    }
    //そのターンのPlayerの行動
    promotePlayer() {
        if (this.type == "house") {
            this.gameDecisionHouse(this.gameType);
        } else if (this.type == "ai") {
            this.gameDecisionAI(this.gameType);
        } else if (this.type == "user") {
        }
    }

    //---行動決定---//
    gameDecisionHouse() {
        if (this.actStatus == "betting") {
            this.action = null;
        } else if (this.actStatus == "acting") {
            // this.action = RandomChoiceTools.randomChoice(["hit", "stand"]);
        } else if (this.actStatus == "evaluate"){
            // this.action = "evaluate";
        }

    };
    gameDecisionAI() {
        if(this.gameType == "BlackJack"){
            if (this.actStatus == "betting") {
                this.action = "bet";
            } else if (this.actStatus == "acting") {
                let choice = RandomChoiceTools.valriableRandomChoice(this.actionProbability);
                this.action = choice;
            } else if (this.actStatus == "evaluate"){
                this.action = "evaluate";
            }
        }else if(this.gameType == "Poker"){
            if (this.actStatus == "betting1") {
                let choice = RandomChoiceTools.valriableRandomChoice(this.actionProbability);
                this.action = choice;
            } else if (this.actStatus == "exchange"){
                this.action = "exchange";
            } else if (this.actStatus == "betting2") {
                let choice = RandomChoiceTools.valriableRandomChoice(this.actionProbability);
                this.action = choice;
            } else if (this.actStatus == "evaluate"){
                this.action = "evaluate";
            }
        }
    };

    //---AIの行動パターン計算---//
    aiThinking(players, maxBet, noOneBet){
        if(this.gameType == "BlackJack"){
            if(this.actStatus == "acting"){
                const ranks = {"A": 11, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "J": 10, "Q": 10, "K": 10};
                this.actionProbability["hit"] = 0;
                this.actionProbability["surrender"] = 0;
                this.actionProbability["stand"] = 0;
                this.actionProbability["double"] = 0;

                if(this.type == "ai"){
                    if(this.handEvalution == 999 || this.handEvalution == 21){
                        this.actionProbability["stand"] = 1;
                        return;
                    }
                    this.actionProbability["surrender"] = (ranks[players[0].hand[0].rank]) / 40;
                    this.actionProbability["stand"] = this.handEvalution / 20;
                    this.actionProbability["hit"] = (20 - this.handEvalution) / 17;
                    if(this.actionProbability["double"]){
                        this.actionProbability["double"] = 0;
                    }else{
                        this.actionProbability["double"] = ((11-ranks[players[0].hand[0].rank])/11 * (20 - this.handEvalution) / 20)/2;
                    }
                }
            }
        }else if(this.gameType == "Poker"){
            if(this.actStatus == "betting1" || this.actStatus == "betting2"){
                this.planToExchange = this.pokerExchangeCardMaskCalc();//交換するカードの決定
                let leaveCardsNumInHand = 0;//初期化
                for(let i = 0; i < this.hand.length ; i++){//枚数決定
                    if(!this.planToExchange[i]) ++leaveCardsNumInHand;
                }
                let underLineOfBet = maxBet - this.bet;//call,raiseの最低ライン
                this.planToBet = 10 * RandomChoiceTools.randomInt(1, 5)

                //playerのactionProbabilityの初期化
                this.actionProbability["check"] = 0;
                this.actionProbability["bet"] = 0;
                this.actionProbability["call"] = 0;
                this.actionProbability["raise"] = 0;
                this.actionProbability["drop"] = 0;
                if(noOneBet && this.actStatus == "betting1"){
                    if(this.handEvalution[0] == "High Cards" && leaveCardsNumInHand > 3){
                        this.actionProbability["check"] = 0.1 * underLineOfBet / this.planToBet ;
                        this.actionProbability["bet"] = 0.9;
                    }else{
                        this.actionProbability["bet"] = 1;
                    }
                }else{
                    if(this.handEvalution[0] == "High Cards"){
                        this.actionProbability["drop"] = 0.05 * underLineOfBet / this.planToBet;
                        this.actionProbability["call"] = 0.8;
                        this.actionProbability["raise"] = 0.1;
                    }else{
                        this.actionProbability["drop"] = 0;
                        this.actionProbability["call"] = 0.7;
                        this.actionProbability["raise"] = 0.3 * 100 / maxBet;

                    }
                }
            }else if(this.actStatus == "exchange"){
                for(let i = 0; i < this.hand.length ; i++){//枚数決定
                    this.hand[i].isSelected = this.planToExchange[i]
                }
            }
        }
    }
    pokerExchangeCardMaskCalc(){//自分の交換する手札のマスクを計算
        //pair系、ストレート系、フラッシュ系、ストレートフラッシュ系に分けた
        //一緒にするとストレートとペア等を一緒に狙うためうまくできない
        const pokerHandProbPair= {
            "High Cards":10,  //1302540/2598960,
            "One Pair":1098240/2598960,//Pair
            "Two Pair":123552/2598960,//Pair
            "Three of a Kind":54912/2598960,//pair
            "Full House":3744/2598960,//Pair
            "Four of a Kind":624/2598960,//Pair
        };
        const pokerHandProbStraight= {
            "High Cards":10,  //1302540/2598960,//
            "Straight":10200/2598960,//Straight
        };
        const pokerHandProbFlush= {
            "High Cards":10,  //1302540/2598960,//
            "Flush":5108/2598960,//Flush
        };
        const pokerHandProbStraightFlush= {
            "High Cards":10,  //1302540/2598960,//
            "Straight Flush":36/2598960,//Straight Flush
            "Royal Flush":4/2598960//Straight Flush
        };
        let intPairScore = {};
        for(let key in pokerHandProbPair){
            intPairScore[key] = Number(Math.floor(1/pokerHandProbPair[key]));
        }
        let intStraightScore = {};
        for(let key in pokerHandProbStraight){
            intStraightScore[key] = Number(Math.floor(1/pokerHandProbStraight[key]));
        }
        let intFlushScore = {};
        for(let key in pokerHandProbFlush){
            intFlushScore[key] = Number(Math.floor(1/pokerHandProbFlush[key]));
        }
        let intStraightFlushScore = {};
        for(let key in pokerHandProbStraightFlush){
            intStraightFlushScore[key] = Number(Math.floor(1/pokerHandProbStraightFlush[key]));
        }
        let tempDeck = new Deck();
        tempDeck.exclusionCards(this.hand);
        let handTmpList = this.hand.concat();
        let handMaskPairScore = [0, 0, 0, 0, 0];
        let handMaskStraightScore = [0, 0, 0, 0, 0];
        let handMaskFlushScore = [0, 0, 0, 0, 0];
        let handMaskStraightFlushScore = [0, 0, 0, 0, 0];
        let handEvalution = this.evaluateHandPoker(handTmpList);
        let numOfTrial= 1000;
        for(let i = 0; i<numOfTrial;i++){
            tempDeck.shuffle();
            let randomMask = RandomChoiceTools.makeRandomMask(5);
            let handTmpList = this.hand.concat();
            for(let j = 0; j < randomMask.length; j++){
                if(randomMask[j]){
                    handTmpList.splice(j,1);
                    handTmpList.splice(j,0,tempDeck.card(RandomChoiceTools.randomInt(0,47)));
                }
            }
            handEvalution = this.evaluateHandPoker(handTmpList);
            for(let j = 0; j < 5; j++){
                if([handEvalution[0]] in intPairScore){
                    handMaskPairScore[j] +=
                        randomMask[j] ? +intPairScore[handEvalution[0]] : -intPairScore[handEvalution[0]];
                }
                if([handEvalution[0]] in intStraightScore){
                    handMaskStraightScore[j] +=
                        randomMask[j] ? +intStraightScore[handEvalution[0]] : -intStraightScore[handEvalution[0]];
                }
                if([handEvalution[0]] in intFlushScore){
                    handMaskFlushScore[j] +=
                        randomMask[j] ? +intFlushScore[handEvalution[0]] : -intFlushScore[handEvalution[0]];
                }
                if([handEvalution[0]] in intStraightFlushScore){
                    handMaskStraightFlushScore[j] +=
                        randomMask[j] ? +intStraightFlushScore[handEvalution[0]] : -intStraightFlushScore[handEvalution[0]];
                }
            }
        }
        let handMaskScore = [0, 0, 0, 0, 0]
        let handMaskList = [];
        handMaskList.push(handMaskPairScore);
        handMaskList.push(handMaskStraightScore);
        handMaskList.push(handMaskFlushScore);
        handMaskList.push(handMaskStraightFlushScore);
        let handMaskMinScore = 0;
        for(let i = 0; i < handMaskList.length; i++){
            if(Math.min.apply(null, handMaskList[i]) < handMaskMinScore ){
                handMaskMinScore = Math.min.apply(null, handMaskList[i]);
                handMaskScore = handMaskList[i];
            }
        }
        let pokerExchangeCardMask = [];
        let zeroCounter = 0;
        for(let i = 0; i < 5; i++){
            pokerExchangeCardMask[i] = handMaskScore[i] >= 0;
            if(handMaskScore[i] == 0) zeroCounter++;
        }
        if(zeroCounter == 5) pokerExchangeCardMask = RandomChoiceTools.makeRandomMask(5);
        return pokerExchangeCardMask;
    }

    //---BJ手札評価関連---//
    evaluateHandBlackJack() {//BlackJackの手札評価
        let ranks = {
            "A": 11, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "J": 10, "Q": 10, "K": 10
        };
        let faceCard = ["J", "Q", "K"];
        let number = 0;
        for (let i = 0; i < this.hand.length; i++) {
            number += ranks[this.hand[i].rank];
        }
        //21を超えたとき1を11⇒1にする
        let i = 0;
        while(number > 21 && i < this.hand.length ){
            if (this.hand[i].rank == "A"){
                number -= 10;
            }
            i++;
        }
        //BJの時999
        if(this.hand.length == 2){
            if(faceCard.includes(this.hand[0].rank) && this.hand[1].rank == "A"){
                number = 999;
            }else if(faceCard.includes(this.hand[1].rank) && this.hand[0].rank == "A"){
                number = 999;
            }
        }
        return number;
    }
    //---Poker手札評価関連---//
    evaluateHandPoker(hand) {//Pokerの手札評価 Porkerの手札評価用に変換Qと6のtwoPairのとき、[ [ 'Two Pair' ], [ 'Q', '6' ] ]をthis.handEvalutionにいれる
        let handRanksMap = this.handRanksFrequencyDistribution(hand);
        let handSuitsMap = this.handSuitsFrequencyDistribution(hand);
        //役決め
        const pokerHandList = {
            "High Cards":0,
            "One Pair":1,
            "Two Pair":2,
            "Three of a Kind":3,
            "Straight":4,
            "Flush":5,
            "Full House":6,
            "Four of a Kind":7,
            "Straight Flush":8,
            "Royal Flush":9
        }
        let pokerHand;
        let pokerHandRank =[];
        //Pair系
        let maxCount = 0;
        let secondCount = 0;
        for(let rank in handRanksMap){
            if(maxCount <= handRanksMap[rank]){
                if(secondCount <= handRanksMap[rank]){
                    secondCount = maxCount;
                }
                maxCount = handRanksMap[rank];
            }else if(secondCount <= handRanksMap[rank]){
                secondCount = handRanksMap[rank];
            }

        }

        if(maxCount == 4){
            pokerHand = "Four of a Kind";
            for(let rank in handRanksMap){
                if(maxCount == handRanksMap[rank]){
                    pokerHandRank.push(rank);
                }
            }
        }else if (maxCount == 3 && secondCount == 2){
            pokerHand = "Full House";
            for(let rank in handRanksMap){
                if(maxCount == handRanksMap[rank]){
                    pokerHandRank.unshift(rank);
                }else if(maxCount == handRanksMap[rank]){
                    pokerHandRank.push(rank);
                }
            }
        }else if (maxCount == 3){
            pokerHand = "Three of a Kind";
            for(let rank in handRanksMap){
                if(maxCount == handRanksMap[rank]){
                    pokerHandRank.push(rank);
                }
            }
        }else if (maxCount == 2 && secondCount == 2){
            pokerHand = "Two Pair";
            for(let rank in handRanksMap){
                if(maxCount == handRanksMap[rank]){
                    pokerHandRank.unshift(rank);
                }
            }
        }else if (maxCount == 2){
            pokerHand = "One Pair";
            for(let rank in handRanksMap){
                if(maxCount == handRanksMap[rank]){
                    pokerHandRank.push(rank);
                }
            }
        }else{
            pokerHand = "High Cards";
        }

        //straight系
        let isStraight = false;
        let straightMaxRank;
        let sum = 0;
        for(let rank in handRanksMap){
            if(handRanksMap[rank] == 1){
                straightMaxRank = rank;
                sum ++
                if(sum == 5){
                    if(pokerHandList[pokerHand] < pokerHandList["Straight"]){
                        pokerHand = "Straight";
                        pokerHandRank = [straightMaxRank];
                    }
                    isStraight = true;
                }
            }else{
                sum = 0;
            }
        }

        //flash系
        let isFlash = false;
        for(let suit in handSuitsMap){
            if (handSuitsMap[suit] == 5){
                if(pokerHandList[pokerHand]< pokerHandList["Flush"]){
                    pokerHand = "Flush"
                    pokerHandRank = [straightMaxRank];
                }
                isFlash = true;
                break;
            }
        }
        //強いやつ
        if(isFlash && isStraight){
            if(straightMaxRank == "A"){
                pokerHand = "Royal Flush";
            }else{
                if(pokerHandList[pokerHand] < pokerHandList["Straight"])
                    pokerHand = "Straight Flush";
            }
        }
        return [[pokerHand],pokerHandRank];

    }
    convertHandIntoNumericalValue(){//手札の強さ数値化
        let numericalValue = 0;
        const intPokerHandMap = {
            "High Cards":0,
            "One Pair":1,
            "Two Pair":2,
            "Three of a Kind":3,
            "Straight":4,
            "Flush":5,
            "Full House":6,
            "Four of a Kind":7,
            "Straight Flush":8,
            "Royal Flush":9
        }
        let intRanksMap = {"2":0, "3":1, "4":2, "5":3, "6":4, "7":5, "8":6, "9":7, "10":8, "J": 9, "Q": 10, "K": 11, "A": 12};
        //役の数値化
        numericalValue += intPokerHandMap[this.handEvalution[0]] * 10 ** 14;
        //役のsuitの数値化
        if(intRanksMap[this.handEvalution[1][0]] != undefined){
            numericalValue += intRanksMap[this.handEvalution[1][0]] * 10 ** 12;
        }
        if(intRanksMap[this.handEvalution[1][1]] != undefined){
            numericalValue += intRanksMap[this.handEvalution[1][1]] * 10 ** 10;
        }

        //手札の数値化
        let handList = [];
        for(let i = 0; i < this.hand.length; i++){
            handList.push(intRanksMap[this.hand[i].rank]);
        }
        handList.sort(
            function(a,b){
                return (a < b ? -1 : 1);
            }
        );

        //全体の合計
        for(let i = 0; i < this.hand.length; i++){
            numericalValue += handList[i] * 10 ** (i * 2);
        }
        return numericalValue;
    }
    handRanksFrequencyDistribution(hand){//handRankの度数分布
        let handRanksMap = {"A": 0, "K": 0, "Q": 0, "J": 0, "10": 0, "9": 0, "8": 0, "7": 0, "6": 0, "5": 0, "4": 0, "3": 0, "2": 0 };
        for(let i = 0 ; i < hand.length; i++){
            handRanksMap[hand[i].rank]++;
        }
        return handRanksMap;
    }
    handSuitsFrequencyDistribution(hand){//handSuitの度数分布
        let handSuitsMap = {"H":0, "D":0, "C":0, "S":0};
        for(let i = 0 ; i < hand.length; i++){
            handSuitsMap[hand[i].suit] += 1;
        }
        return handSuitsMap;
    }

    //---動作関連---//
    drawCardsToHand(number, deck) {//deckからnumber枚カードを手札に加える
        for (let i = 0; i < number; i++) {
            this.hand.push(deck.drawOne());
        }
    }
    exchangeOneCard(card, fromDeck, toDeck){//カードを引きほかのデッキへ加える
        for(let i=0; i < this.hand.length; i++){
            if(card == this.hand[i]){
                this.hand[i].cardStatus = false; //カードの裏表
                this.hand[i].isSelected = false;
                toDeck.push(this.hand[i]);
                this.hand.splice(i, 1);
                let temp = fromDeck.drawOne();
                this.hand.splice(i,0,temp);
                break;
            }
        }
    }
}

class Table {
    constructor(gameType, name) {
        this.gameType = gameType;
        this.players = [];
        if (this.gameType == "BlackJack"){
            this.players.push(new Player("house", "house", this.gameType));
        }else if(this.gameType == "Poker"){
            this.players.push(new Player("AI0", "ai", this.gameType));
            this.players[0].amIDealer = true;
        }
        this.players.push(new Player("AI1", "ai", this.gameType));
        this.players.push(new Player(name, "user", this.gameType));
        this.players.push(new Player("AI2", "ai", this.gameType));
        this.playersLinkedList = new LinkedList(this.players);
        if (this.gameType == "BlackJack"){
            this.iteratorOfPlayer = this.playersLinkedList.head;
        }else if(this.gameType == "Poker"){
            this.iteratorOfPlayer = this.playersLinkedList.head.next;//最初は親の次
        }
        this.prevPlayer = this.playersLinkedList.head;
        this.playerNum = this.players.length;
        this.losers = [];

        if (this.gameType == "BlackJack"){
            this.gamePhase = "start";
        }else if(this.gameType == "Poker"){
            this.gamePhase = "start";
            this.noOneBet = true;//bettingPhaseで誰もbetしてなかったらbet or check　が宣言できる
            this.totalBet = 0;//賭け合計額
            this.maxBet = 0;
            this.turnBettingLog =[]
        }
        this.turnCounter = 0;

    }
    //---メイン---//
    haveTurn() {//---haveTurnを繰り返すことでゲームが進む---//
        if (this.gameType == "BlackJack"){
            if(this.gamePhase == "start"){
                this.blackJackStartPhase();
            }else if(this.gamePhase == "betting") {
                this.blackJackBettingPhase();
            }else if(this.gamePhase == "acting") {
                this.blackJackActingPhase();
            }else if(this.gamePhase == "evaluate") {
                this.blackJackEvaluatePhase();
            }
            this.turnCounter++;
        }else if(this.gameType == "Poker"){
            if(this.gamePhase == "start"){
                this.pokerstartPhase();
            }else if (this.gamePhase == "betting1") {
                this.pokerBettingPhase();
            }else if (this.gamePhase == "exchange") {
                this.pokerExchangePhase();
            }else if (this.gamePhase == "betting2") {
                this.pokerBettingPhase();
            }else if (this.gamePhase == "evaluate") {
                this.pokerEvaluatePhase();
            }
            this.turnCounter++;
        }
    };

    //---BJ各Phase---//
    blackJackStartPhase(){
        this.deck = new Deck();
        this.deck.shuffle();
        this.changeActionAll(null)
        for (let i = 0; i < this.players.length; i++) {
            if(this.players[i].status == "bust"){
                this.players[i].hand = [];
                this.players[i].actStatus = "bust"
                this.players[i].bet = 0;
                this.players[i].handEvalution = 0;
                continue;
            }
            this.players[i].hand = [];
            this.players[i].drawCardsToHand(2, this.deck);
            this.players[i].bet = 0;
            this.players[i].handEvalution = this.players[i].evaluateHandBlackJack();
            this.players[i].actionProbability = {};
            this.players[i].actStatus == "betting"
        }
    }
    blackJackBettingPhase() {
        let turnPlayer = this.iteratorOfPlayer;
        if(turnPlayer.actStatus == "betting"){
            turnPlayer.promotePlayer();
            this.evaluateMove(turnPlayer);
            turnPlayer.actStatus = "acting";
        }
        this.iteratorOfPlayer = this.iteratorOfPlayer.next;
        this.prevPlayer = turnPlayer;
        if(this.iteratorOfPlayer.actStatus == "acting"){
            this.gamePhase = "acting";
            for(let i = 0; i < this.players.length; i++){
                if(this.players[i].type == "house"){
                    this.players[i].hand[0].turnCard();
                }else{
                    for(let j = 0; j < this.players[i].hand.length; j++){
                        this.players[i].hand[j].turnCard();
                    }
                }
            }
            this.iteratorOfPlayer = this.playersLinkedList.head;
        }
    }
    blackJackActingPhase() {//全員のactStatusがevaluateになったら次
        if(this.iteratorOfPlayer.actStatus == "acting"){
            if(this.iteratorOfPlayer.status == "bust" || this.iteratorOfPlayer.type == "house"){
                this.iteratorOfPlayer.actStatus = "evaluate"
            }else{
                this.iteratorOfPlayer.aiThinking(this.players);
                this.iteratorOfPlayer.promotePlayer();
                this.evaluateMove(this.iteratorOfPlayer);
            }
        }

        if(this.iteratorOfPlayer.action != "hit" || this.iteratorOfPlayer.status == "bust" || this.iteratorOfPlayer.status == "lose"){
            this.iteratorOfPlayer.actStatus = "evaluate"
            this.iteratorOfPlayer = this.iteratorOfPlayer.next;
        }

        if(this.iteratorOfPlayer.actStatus == "evaluate" && this.iteratorOfPlayer.next.actStatus == "evaluate"){
            this.gamePhase = "evaluate";
            this.iteratorOfPlayer = this.playersLinkedList.head;
        }
    }
    blackJackEvaluatePhase() {
        //一回目はhouseなので先に17以上にする
        let house = this.players[0];
        house.hand[1].turnCard();
        while(17 > house.handEvalution){
            this.drawAndEvaluate(1, this.deck, house);
            house.hand[house.hand.length-1].turnCard();
        }
        if(house.handEvalution > 21) house.status = "lose";
        this.iteratorOfPlayer = this.players[1];
        let turnPlayer = this.iteratorOfPlayer;

        let i = 0;
        while(turnPlayer != house ){
            if(turnPlayer.status == "lose"){
                turnPlayer.status = "lose";
                turnPlayer.bet = 0;
            }else if(house.status == "lose"){
                if(turnPlayer.handEvalution == 999){
                    turnPlayer.status = "win";
                    turnPlayer.chips += turnPlayer.bet * 2.5;
                }else{
                    turnPlayer.status = "win";
                    turnPlayer.chips += turnPlayer.bet * 2;
                }
            }else if(house.handEvalution == 999){
                if(turnPlayer.handEvalution == house.handEvalution){
                    turnPlayer.status = "push";
                    turnPlayer.chips += turnPlayer.bet;
                    turnPlayer.bet = 0;
                }else{
                    turnPlayer.status = "lose";
                    turnPlayer.bet = 0;
                }
            }else{
                if(turnPlayer.handEvalution == house.handEvalution){
                    turnPlayer.status = "push";
                    turnPlayer.chips += turnPlayer.bet;
                    turnPlayer.bet = 0;
                }else if(turnPlayer.handEvalution < house.handEvalution){
                    turnPlayer.status = "lose";
                    turnPlayer.bet = 0;
                }else{
                    turnPlayer.status = "win";
                    turnPlayer.chips += turnPlayer.bet * 2;
                }
            }

            if(turnPlayer.chips <= 0){
                turnPlayer.status = "bust";
                turnPlayer.bet = 0;
            }

            turnPlayer.actStatus = "betting";
            turnPlayer = turnPlayer.next;
            i++;
            if(i > 8){
                console.log("blackJackEvaluatePhase error")
                break;
            }
        }
        this.changeActionAll(null)
        this.gamePhase = "start";
    }

    //---PokerPhase---//
    pokerstartPhase(){
        this.changeActionAll(null)
        this.deck = new Deck();
        this.deck.shuffle();
        this.trashBox = new Deck();
        this.trashBox.emptyDeck();
        this.betList = [];
        this.totalBet = 0;
        for (let i = 0; i < this.players.length; i++) {
            if(this.players[i].status == "bust"){
                this.players[i].hand = [];
                this.players[i].actStatus = "bust"
                this.players[i].bet = 0;
                this.players[i].handEvalution = [];
                this.players[i].handRanksMap = {}
                continue;
            }
            this.players[i].hand = [];
            this.players[i].actStatus = "betting1";
            this.players[i].status = "start"
            this.players[i].drawCardsToHand(5, this.deck);
            if(this.players[i].type == "user"){
                for(let j = 0; j < 5; j++){
                    this.players[i].hand[j].turnCard();
                }
            }
            this.players[i].bet = 100;
            this.players[i].chips -= this.players[i].bet;
            this.maxBet = this.players[i].bet;
            this.totalBet += this.players[i].bet;
            this.players[i].handEvalution = this.players[i].evaluateHandPoker(this.players[i].hand);
            this.players[i].handRanksMap = this.players[i].handSuitsFrequencyDistribution(this.players[i].hand);
            this.players[i].actionProbability = {};
            this.betList.push(this.players[i].bet);
            this.turnBettingLog =[];
            this.iteratorOfPlayer = this.playersLinkedList.head.next;
        }
    }
    //
    pokerBettingPhase(){
        let turnPlayer = this.iteratorOfPlayer;
        if(turnPlayer.actStatus == "betting1"){
            turnPlayer.status = "betting1"
            if(turnPlayer.type == "ai"){
                turnPlayer.aiThinking(this.players,this.maxBet,this.noOneBet);//どう行動するか考えて
                turnPlayer.promotePlayer();//行動決定して
            }
            //userが未選択な場合は飛ばす
            if(turnPlayer.action != null){
                this.evaluateMove(turnPlayer);//実行
                turnPlayer.convertHandIntoNumericalValue();
            }
            //もし次のプレーヤーが自分だった場合、その人が勝者
            if(this.iteratorOfPlayer.next == this.iteratorOfPlayer){
                this.iteratorOfPlayer.status = "win";
                this.changeActStatusAll("evaluate");
                this.gamePhase = "evaluate";
            }
            //userが未選択な場合は飛ばす
            if(turnPlayer.action != null){
                this.iteratorOfPlayer = this.iteratorOfPlayer.next;
            }
            //皆同額かけるまで回す。
            if(this.isAllPlayerSameBet() && this.isAllPlayerActed()){
                this.noOneBet = true;
                this.gamePhase = "exchange";
                this.changeActStatusAll("exchange");
                this.iteratorOfPlayer = this.playersLinkedList.head.next;
                //player4人までしか通用しない
                this.turnToNextToDealer();
            }
        }else if(turnPlayer.actStatus == "betting2"){
            turnPlayer.status = "betting2"
            if(turnPlayer.type == "ai"){
                turnPlayer.aiThinking(this.players,this.maxBet,this.noOneBet)//どう行動するか考えて
                turnPlayer.promotePlayer();//行動決定して
            }
            //userが未選択な場合は飛ばす
            if(turnPlayer.action != null){
                this.evaluateMove(turnPlayer);//実行
                turnPlayer.convertHandIntoNumericalValue();
            }
            if(turnPlayer.action != null){
                this.iteratorOfPlayer = this.iteratorOfPlayer.next;
            }
            //もし次のプレーヤーが自分だった場合、その人が勝者
            if(this.iteratorOfPlayer.next == this.iteratorOfPlayer){
                this.iteratorOfPlayer.status = "win";
                this.changeActStatusAll("evaluate");
                this.gamePhase = "showdown";
            }
            if(this.isAllPlayerSameBet() && this.isAllPlayerActed()){
                this.noOneBet = true;
                this.gamePhase = "showdown";
                this.changeActStatusAll("evaluate");
                this.changeActionAll("evaluate")
                this.turnToNextToDealer();
            }
        }
        this.prevPlayer = turnPlayer;
    }
    pokerExchangePhase(){//AIが何を変えたかわかるように、一人二回回す。
        let turnPlayer = this.iteratorOfPlayer;
        turnPlayer.status = "exchange";
        this.decideChangeCard = false;
        if(turnPlayer.actStatus == "exchange"){
            if(turnPlayer.type == "user"){
                if(turnPlayer.action == "exchange"){
                    turnPlayer.action = "exchange";
                    this.evaluateMove(turnPlayer);
                    turnPlayer.actStatus = "betting2";
                    this.iteratorOfPlayer = this.iteratorOfPlayer.next;
                }
            }else if(turnPlayer.type == "ai"){
                if(!turnPlayer.decideChangeCard){
                    turnPlayer.aiThinking(this.players);
                    turnPlayer.decideChangeCard = true;
                }else{
                    turnPlayer.promotePlayer();
                    this.evaluateMove(turnPlayer);
                    turnPlayer.actStatus = "betting2";
                    this.iteratorOfPlayer = this.iteratorOfPlayer.next;
                }
            }
        }
        if(this.iteratorOfPlayer.actStatus == "betting2"){
            this.gamePhase = "betting2";
            this.changeActionAll(null);
        }
        this.prevPlayer = turnPlayer;
    }
    pokerEvaluatePhase(){
        this.revivalDropPlayer();
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].type != "user"){
                for(let j = 0; j <this.players[i].hand.length ; j++){
                    this.players[i].hand[j].turnCard();
                }
            }
        }
        this.iteratorOfPlayer = this.playersLinkedList.head.next;
        let firstPlayer = this.iteratorOfPlayer;
        let winnerPlayer = this.findWinner();
        winnerPlayer.status = "win";
        let i = 0;
        while(true){
            if(this.iteratorOfPlayer.status == "win"){
                this.turnWinnerPlayer = this.iteratorOfPlayer;
                this.iteratorOfPlayer.chips += this.totalBet;
                this.iteratorOfPlayer.bet = 0;
                this.maxBet = 0;
                this.iteratorOfPlayer = this.iteratorOfPlayer.next;
            }else{
                this.iteratorOfPlayer.status = this.iteratorOfPlayer.chips <= 0 ?  "bust" : "lose";
                if (this.iteratorOfPlayer.status == "bust") this.excludePlayer(this.iteratorOfPlayer);
                this.iteratorOfPlayer.bet = 0;
                this.iteratorOfPlayer = this.iteratorOfPlayer.next;
            }
            if(this.iteratorOfPlayer == firstPlayer){
                break;
            }
            if(this.iteratorOfPlayer == this.iteratorOfPlayer.next){
                break;
            }
            if(i > 10){
                console.log("pokerEvaluatePhase error")
                break;
            }
            i++;
        }



        this.changeActStatusAll("start");
        this.playersLinkedList.head = this.playersLinkedList.head.next;
        this.changeActionAll(null)
    }

    //
    evaluateMove(player) {//actionの実行//
        if(this.gameType == "BlackJack"){
            switch (player.action) {
                case "bet":
                    if(player.type == "ai")player.bet = 20 * RandomChoiceTools.randomInt(1, 5);
                    player.chips -= player.bet;
                    this.totalBet += player.bet;
                    break;
                case "surrender":
                    player.bet =  Math.floor(player.bet / 2);
                    player.status = "lose";
                    break;
                case "stand":
                    player.actStatus = "evaluate";
                    break;
                case "hit":
                    this.drawAndEvaluate(1, this.deck, player)
                    player.hand[player.hand.length-1].turnCard();
                    if (21 <= player.handEvalution && player.handEvalution < 100){//BJは999
                        player.status = "lose";
                        player.action = "lose";//表示用よくない
                    }
                    break;
                case "double":
                    player.bet = 2 * player.bet;
                    player.chips -= player.bet / 2;
                    this.totalBet += player.bet / 2;
                    this.drawAndEvaluate(1, this.deck, player)
                    player.hand[player.hand.length-1].turnCard();
                    player.handEvalution = player.evaluateHandBlackJack();
                    player.actStatus = "evaluate";
                    if (21 <= player.handEvalution && player.handEvalution < 100){
                        player.status = "lose";
                    }
                    break;
                default:
                    if(player.type != "house")console.log("evaluateMove error")
                    break;
            }
        }else if(this.gameType == "Poker"){
            switch (player.action) {
                case "bet":
                    this.noOneBet = false;
                    player.bet += player.planToBet;
                    this.totalBet += player.planToBet;
                    player.chips -= player.planToBet;
                    player.planToBet = 0;
                    this.turnBettingLog.push(player.bet);
                    this.maxBet = player.bet;
                    break;
                case "call":
                    player.planToBet = this.maxBet - player.bet;
                    this.totalBet += player.planToBet;
                    player.chips -= player.planToBet;
                    player.bet = this.maxBet;
                    player.planToBet = 0;
                    break;
                case "raise":
                    player.bet += (player.planToBet + this.maxBet);
                    this.totalBet += player.bet;
                    player.chips -= player.bet;
                    player.planToBet = 0;
                    this.maxBet = player.bet;
                    this.turnBettingLog.push(player.bet);
                    break;
                case "drop":
                    player.status = "drop"
                    player.bet = 0;
                    this.excludePlayer(player);
                    break;
                case "check":
                    player.status = "check"
                    player.bet = 0;
                    this.excludePlayer(player);
                    break;
                case "exchange":
                    let cache = [];
                    for(let i = 0; i < player.hand.length; i++){
                        cache.push(player.hand[i].isSelected);
                    };
                    for(let i = 0; i < cache.length; i++){
                        if(cache[i]){
                            player.exchangeOneCard(player.hand[i], this.deck, this.trashBox)
                            if(player.type == "user") player.hand[i].turnCard();
                            if (this.deck.length == 0) trashBoxToNewDeck();
                        }
                    }
                    player.handRanksMap = player.handRanksFrequencyDistribution(player.hand);
                    player.handSuitsMap = player.handSuitsFrequencyDistribution(player.hand);
                    player.handEvalution = player.evaluateHandPoker(player.hand);
                    player.action = null;
                    break;
                default:
                    conosle.log("evaluateMove error")
                    break;
            }
        }
    }

    //補助ツール
    isAllPlayerActed(){
        let firstPlayer = this.iteratorOfPlayer;
        let targetPlayer = this.iteratorOfPlayer;
        let i = 0;
        while(true){
            if(targetPlayer.action == null) return false;
            targetPlayer = targetPlayer.next
            if (targetPlayer == firstPlayer) break;
            if(i > 10){
                console.log("isAllPlayerActed error");
                break;
            }
            i++;
        }
        return true;
    }
    isAllPlayerSameBet(){
        let firstPlayer = this.iteratorOfPlayer;
        let targetPlayer = this.iteratorOfPlayer;
        let targetNextPlayer = targetPlayer.next;
        let i = 0;
        while(true){
            if(targetPlayer.bet != targetNextPlayer.bet) return false;
            if (targetNextPlayer == firstPlayer) break;
            targetPlayer = targetPlayer.next
            targetNextPlayer = targetNextPlayer.next;
            if(i > 10){
                console.log("isAllPlayerSameBet error");
                break;
            }
            i++;
        }
        return true;
    }
    changeActStatusAll(actStatus){
        for(let i = 0; i < this.players.length; i++){
            this.players[i].actStatus = actStatus;
        }
    }
    changeActionAll(action){
        for(let i = 0; i < this.players.length; i++){
            this.players[i].action = action;
        }
    }
    updateTotalBet(){
        this.totalBet = 0;
        let firstPlayer = this.iteratorOfPlayer;
        let player = firstPlayer
        let i = 0;
        while(true){
            this.totalBet += player.bet;
            player = player.next
            if(player == firstPlayer)break;
            if(i > 10){
                console.log("updateTotalBet error");
                break;
            }
            i++;
        }
    }
    trashBoxToNewDeck(){
        this.deck = this.trashBox;
        this.deck.shuffle()
        this.trashBox.emptyDeck();
    }
    excludePlayer(player){
        let tmpIteratorOfPlayer = this.iteratorOfPlayer;
        let i = 0;
        while(tmpIteratorOfPlayer.next != player){
            tmpIteratorOfPlayer = tmpIteratorOfPlayer.next;
            if(i > 10){
                console.log("excludePlayer error");
                break;
            }
            i++;
        }
        tmpIteratorOfPlayer.next = player.next;
    }
    turnToNextToDealer(){
        this.iteratorOfPlayer = this.playersLinkedList.head.next;
        let i = 0;
        while(i < this.players.length){
            if(this.iteratorOfPlayer.status == "check" || this.iteratorOfPlayer.status == "drop"){
                this.iteratorOfPlayer = this.iteratorOfPlayer.next;
                i++
                continue;
            }
            return
        }
        console.log("turnToNextToDealer error")
    }
    findWinner(){
        let firstPlayer = this.iteratorOfPlayer;
        let winnerPlayer;
        let maxValue = 0;
        let targetPlayer = firstPlayer;
        let i = 0;
        while(true){
            if(targetPlayer.status == "win"){
                return targetPlayer;
            }else if(targetPlayer.status == "drop" || targetPlayer.status == "check"){
                targetPlayer = targetPlayer.next;
            }
            else{
                let targetPlayerValue = targetPlayer.convertHandIntoNumericalValue()
                if (targetPlayerValue > maxValue){
                    maxValue = targetPlayerValue;
                    winnerPlayer = targetPlayer;
                }
                targetPlayer = targetPlayer.next;
            }
            if(targetPlayer == firstPlayer) break;
            if(i > 10){
                console.log("findWinner error")
                break;
            }
            i++;
        }
        return winnerPlayer;
    }
    drawAndEvaluate(number, deck, player){
        for (let i = 0; i < number; i++) {
            player.hand.push(deck.drawOne());
        }
        player.handEvalution = player.evaluateHandBlackJack();
    }
    revivalDropPlayer(){
        for(let i = 0; i < this.players.length; i++){
            if(this.players[(i+1)%this.players.length].status == "drop" || this.players[(i+1)%this.players.length].status == "check"){
                this.players[i].next = this.players[(i+1)%this.players.length];
            }
        }
    }
}

//ランダム計算ツール
class RandomChoiceTools{
    static randomChoice(choices) {//choicesからランダムで選ぶ
        return choices[RandomChoiceTools.randomInt(0, choices.length)];
    }
    static valriableRandomChoice(choicesRateList){//choicesから決まった確率でランダムで選ぶ
        //choicesはmap{選択A:0.5, 選択B:0.1 ...}その確率で選択肢を選ぶ
        //※確率の合計が1にならなくても良い
        let sum = 0;
        let choiceMap = Object.create(choicesRateList);
        for(let choice in choicesRateList){
            sum += choiceMap[choice];
            choiceMap[choice] = sum;
        }
        let randomNum = Math.random() * sum;
        for(let choice in choicesRateList){
            if(randomNum < choiceMap[choice]){
                return choice;
            }
        }
        console.log("valriableRandomChoice error");
    }
    static randomInt(max, min) {//ランダムなintを返す
        return Math.floor(Math.random() * (max - min) + min);
    }
    static makeRandomMask(num){// num桁の0or1のランダムマスクを返す
        let randomMask = []
        for(let i = 0; i < num ; i ++ ){
            randomMask.push(Boolean(Math.floor(Math.random()*2)));
        }
        return randomMask;
    }
}

Render.gameSelectPage()