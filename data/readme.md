このモジュールは，jrfareで用いるデータを作成するためのスクリプトを保存した部分です．

このプロジェクトに含まれる「営業キロ」「運賃計算キロ」のデータは 「MARS for MS-DOS（SWA作）」のデータを基にしております．

MARS for MS-DOSに含まれるmars_sd.dat,mars_nn.datを marsToTSV.jsを用いてTSV形式に変換しました．今後,このtsvを編集し更新していくため，再びMARS for MS-DOSのデータを元にtsvを生成することはしないため，marsToTSV.jsはgistに隔離しました.(https://gist.github.com/m77so/2c5a193f1222246a96a8c533d188eaa4)

TSV形式に変換したものが，distances.tsv,lines.tsv,stations.tsvです．

現在，元にしたMARS for MS-DOSのバージョンは5.23となっています．

その他の設定ファイルを結合し，tsvToJSON.jsよりJSONを生成します．

marsToTSV.js,tsvTOJSON.jsは前project,deimosのFormat.tsを元に作成されたものです．


頃合いを見てデータ部分のみsubmodule化したいと思っています．

# Resource Files

- distances.tsv
  - The list of track length.
  - 営業キロ一覧
  - Original is MARS for MS-DOS
- lines.tsv
  - The list of liens.
  - 路線一覧
  - Original is MARS for MS-DOS
- stations.tsv
  - The list of station.
  - 駅一覧
  - Original is MARS for MS-DOS
- chihoLines.txt
  - The list of local lines.
  - 地方交通線の一覧
- city.json
  - The list of specific ward municipal system.
  - 特定都区市内の一覧
- company.json
  - The list of which companies lines belong to.
  - 路線の所属会社一覧
- shinzai.json
  - The list of PO art.16-2 
  - Refer to article 16-2 on Passenger Operations
- jrhFare.tsv, jrqFare.tsv, jrsFare.tsv
  - JR Hokkaido, Kyushu, Shikoku specific fare.
  - 別表第2号イ1〜3に基づくJR北海道,九州,四国の特定額