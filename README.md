# BlackJack_Poker

## URL
https://nori-ut3g.github.io/BlackJack_Poker/

## 概要

BlackJackとPokerです。
Recursionの課題の一環で作成しました。
コードはすべてオリジナルです。
課題では、BlackJackの実装が課題ですが、個人的にPokerも実装したかったので作成しました。
（作成日時：2020年10月）
![](img/Poker.png)
![](img/BlackJack.png)

## 特徴
PokerにおいてはNPCが適切なカードが交換できるように工夫しました。


### Pokerのカード交換アルゴリズム
モンテカルロ法のように、役の強さと確率を計算して最も効果的なカードが交換されるように工夫しました。
具体的には、毎回複数回試行し、役のそれぞれの確立の逆数を役の点数とし、その点数が一番多くなるカードを交換するようにしました。

