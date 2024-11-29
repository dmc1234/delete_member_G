import fetch from 'node-fetch';

export async function POST(req) {
  try {
    // リクエストボディからデータを受け取る
    const { host, site_id, site_pass, member_id } = await req.json();
    const url = `https://${host}/payment/DeleteMember.idPass`;

    const formData = new URLSearchParams();
    formData.append('SiteID', site_id);
    formData.append('SitePass', site_pass);
    formData.append('MemberID', member_id);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=windows-31j' },
      body: formData,
    });

    const data = await response.text();
    return new Response(
      JSON.stringify({ member_id, datetime: new Date(), data: data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ message: 'Error processing member', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
