'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';

type FormData = { host: string; siteId: string; sitePass: string; csvData: string[] };

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    host: '', siteId: '', sitePass: '', csvData: [],
  });
  const [fileName, setFileName] = useState('');
  const [log, setLog] = useState<unknown[]>([]);
  const [submitCount, setSubmitCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors: Partial<Record<keyof FormData, string>> = {};
  for (const key of Object.keys(formData) as (keyof FormData)[]) {
    if (formData[key].length === 0) errors[key] = '必須項目です。';
  }
  const isDisableButton = Object.keys(errors).length > 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName('');
    setFormData(prev => ({ ...prev, csvData: [] }));
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('CSVファイルを選択してください。');
      return;
    }
    Papa.parse<string[]>(file, {
      complete: result => {
        const csvData = result.data.map(row => row[0]).filter(Boolean);
        setFormData(prev => ({ ...prev, csvData }));
        if (csvData.length) setFileName(file.name);
      },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isDisableButton) return;
    setSubmitCount(0);
    setTotalCount(formData.csvData.length);
    setLog([]);
    setIsSubmitting(true);
    try {
      for (const memberCode of formData.csvData) {
        setSubmitCount(count => count + 1);
        const response = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            host: formData.host, site_id: formData.siteId,
            site_pass: formData.sitePass, member_id: memberCode,
          }),
        });
        if (!response.headers.get('content-type')?.includes('application/json')) {
          throw new Error(`会員ID ${memberCode}: サーバーがJSONを返しませんでした（HTTP ${response.status}）。処理結果を確認してください。`);
        }
        const data = await response.json();
        if (!response.ok) {
          throw new Error(`会員ID ${memberCode}: ${data.message ?? '通信エラー'}（HTTP ${response.status}）`);
        }
        setLog(prev => [...prev, data]);
      }
    } catch (error) {
      setLog(prev => [...prev, `エラーが発生しました: ${error instanceof Error ? error.message : String(error)}`]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2))
      .catch(() => alert('ログをコピーできませんでした。'));
  };

  return (
    <>
      <div className="progress cal s12">
        <div className="determinate light-blue"></div>
      </div>
      <div className="container mb-5">
        <div className="row">
          <form onSubmit={handleSubmit} className="col s12">
            <div className="file-field input-field">
              <div className="light-blue darken-4 btn-large">
                <span>FILE</span>
                <input onChange={handleFileUpload} id="csv_data" name="csvData" type="file"/>
              </div>
              <div className="file-path-wrapper">
                <input className="file-path validate" type="text" placeholder="会員IDのCSVファイルを追加します。" value={fileName} readOnly />
              </div>
              <span className="helper-text red-text">{errors.csvData}</span>
            </div>
            <div className="row">
              <div className="input-field col s12">
                <input onChange={handleChange} id="host" name="host" type="text"/>
                <label htmlFor="host" className={formData.host ? 'active' : undefined}>host</label>
                <span className="helper-text red-text">{errors.host}</span>
              </div>
            </div>
            <div className="row">
              <div className="input-field col s6">
                <input onChange={handleChange} id="site_id" name="siteId" type="text"/>
                <label htmlFor="site_id" className={formData.siteId ? 'active' : undefined}>site_id</label>
                <span className="helper-text red-text">{errors.siteId}</span>
              </div>
              <div className="input-field col s6">
                <input onChange={handleChange} id="site_pass" name="sitePass" type="password"/>
                <label htmlFor="site_pass" className={formData.sitePass ? 'active' : undefined}>site_pass</label>
                <span className="helper-text red-text">{errors.sitePass}</span>
              </div>
            </div>

            <button type="submit" disabled={isDisableButton || isSubmitting} className="col s2 light-blue darken-4 hoverable waves-effect waves-light btn-large" style={{'float': 'right'}}>
              {
                isSubmitting
                ? <div className="preloader-wrapper small active" style={{'verticalAlign': 'middle'}}>
                    <div className="spinner-layer spinner-blue-only">
                      <div className="circle-clipper left">
                        <div className="circle"></div>
                      </div>
                      <div className="gap-patch">
                        <div className="circle"></div>
                      </div>
                      <div className="circle-clipper right">
                        <div className="circle"></div>
                      </div>
                    </div>
                  </div>
                  : <>
                    <i className="material-icons left">person_remove</i>
                    実行
                  </>
              }
            </button>
            {
              isSubmitting
                ? <div className="col s12">
                  <p className="red-text" style={{'float': 'right', 'marginRight': '-1rem', 'fontWeight': 'bold'}}>ブラウザは閉じないでください。 <span className="black-text">処理状況: {submitCount}/{totalCount}件中</span></p>
                </div>
                : <></>
            }
          </form>
        </div>
      </div>
      <div className="container">
        <div className="divider mb-1" />
        <div className="row log-box">
          <div className="col s12">
            <h6 className="col s6 left-align">log: </h6>
            <div className="col s6 right-align">
              <button onClick={handleCopyToClipboard} className="btn-floating btn waves-effect waves-light green">
                copy
              </button>
            </div>
            <pre className="col s12 light-blue lighten-5 min-height-100">
              {JSON.stringify(log, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactForm;
