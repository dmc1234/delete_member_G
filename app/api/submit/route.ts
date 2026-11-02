export async function POST(req: Request) {
  const input = await req.json().catch(() => null);
  if (!input || ['host', 'site_id', 'site_pass', 'member_id'].some(
    key => typeof input[key] !== 'string' || !input[key].trim()
  )) {
    return Response.json({ message: 'host、サイトID、パスワード、会員IDが必要です。' }, { status: 400 });
  }

  const { host, site_id, site_pass, member_id } = input;
  const hostname = host.trim().toLowerCase();
  const extraHosts = (process.env.GMO_ADDITIONAL_HOSTS ?? '').toLowerCase().split(',').map(h => h.trim());
  if (!/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(hostname) ||
      !(hostname.endsWith('.mul-pay.jp') || extraHosts.includes(hostname))) {
    return Response.json({ message: 'GMOの接続先ホスト名を確認してください。' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://${hostname}/payment/DeleteMember.idPass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=windows-31j' },
      body: new URLSearchParams({ SiteID: site_id, SitePass: site_pass, MemberID: member_id }),
      redirect: 'error',
      cache: 'no-store',
    });
    if (!response.ok) {
      return Response.json({ member_id, message: `GMOからHTTP ${response.status}が返されました。` }, { status: 502 });
    }
    return Response.json({ member_id, datetime: new Date(), data: await response.text() });
  } catch {
    return Response.json({ member_id, message: 'GMOから応答を取得できませんでした。' }, { status: 502 });
  }
}
