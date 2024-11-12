import fetch from 'node-fetch';

export async function POST(req) {
  try {
    // リクエストボディからデータを受け取る
    const { host, site_id, site_pass, member_id } = await req.json();
    // console.log(member_id);
    const url = `https://${host}/payment/DeleteMember.idPass`;

    // member_idごとに非同期リクエストを送信
    const results = await Promise.all(
      member_id.map(async (id) => {
        // console.log(id);
        const formData = new URLSearchParams();
        formData.append('SiteID', site_id);
        formData.append('SitePass', site_pass);
        formData.append('MemberID', id);

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=windows-31j' },
            body: formData,
          });

          const data = await response.text();
          return { member_id: id, datetime: new Date(), data: data };
        } catch (error: any) {
          // fetchが失敗した場合のエラーハンドリング
          return { member_id: id, datetime: new Date(), error: error.message };
        }
      })
    );

    // 結果をレスポンスとして返す
    return new Response(
      JSON.stringify({
        message: 'All member IDs processed',
        results,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    // リクエスト処理全体でエラーが発生した場合のエラーハンドリング
    return new Response(
      JSON.stringify({ message: 'Error processing request', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
