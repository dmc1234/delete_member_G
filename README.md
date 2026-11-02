# GMO会員削除

CSVの先頭列から会員IDを読み取り、1件ずつGMOの会員削除API（idPass）へ送信するNext.jsアプリです。空行は無視し、会員IDを文字列のまま扱います。CSVにヘッダーは付けません。

## 開発と検証

Node.js 24で `npm ci` を実行します。`npm run dev` で開発サーバーを起動できます。本番相当の確認には `npm run lint`、`npm test`、`npm run build`、`npm start` を使用してください。

APIテストは外部通信をモックするため、実際の会員を削除しません。起動後は、`POST /api/submit` に空のJSONオブジェクトを送ってHTTP 400とJSONのエラーが返ることを確認できます。この確認もGMOには接続しません。

## 接続先

画面のhostには、GMOの管理画面に記載されたホスト名のみを入力します。通常の接続先は `*.mul-pay.jp` です。契約上別ドメインのホストを使用する場合は、サーバー側の `GMO_ADDITIONAL_HOSTS` に正確なホスト名をカンマ区切りで登録してください。パスは `/payment/DeleteMember.idPass` 固定です。

通信エラーの場合はその会員で処理を止めます。GMO側で処理済みの可能性があるため、再実行する前に管理画面で結果を確認してください。
