このモジュールは，jrfareで用いるデータを作成するためのスクリプトを保存した部分です．

このプロジェクトに含まれる「営業キロ」「運賃計算キロ」のデータは 「MARS for MS-DOS（SWA作）」のデータを基にしております．

MARS for MS-DOSに含まれるmars_sd.dat,mars_nn.datを marsToTSV.jsを用いてTSV形式に変換します．

TSV形式に変換したものが，distances.tsv,lines.tsv,stations.tsvです．

現在，元にしたMARS for MS-DOSのバージョンは5.23となっています．

その他の設定ファイルを結合し，tsvToJSON.jsよりJSONを生成します．

marsToTSV.js,tsvTOJSON.jsは前project,deimosのFormat.tsを元に作成されたものです．


頃合いを見てデータ部分のみsubmodule化したいと思っています．