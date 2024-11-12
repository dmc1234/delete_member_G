'use client';

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

type FormErrors = {
  host?: string,
  siteId?: string,
  sitePass?: string,
  csvData?: string
};

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    host: '',
    siteId: '',
    sitePass: '',
    csvData: []
  });
  const [errors, setErrors] = useState<FormErrors>({
    host: '',
    siteId: '',
    sitePass: '',
    csvData: ''
  });
  const [fileName, setFileName] = useState<string>('');
  const [isDisableButton, setIsDisableButton] = useState<boolean>(true);
  const [log, setLog] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const setData = (name: string, value: string | string[]) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith(".csv")) {
        Papa.parse(file, {
          complete: (result) => {
            const memberIds = result.data.map((row: any) => row[0]);
            setData('csvData', memberIds);
            setFileName(fileName);
          },
          header: false,
        });
      } else {
        alert("CSVファイルを選択してください。");
        setData('csvData', []);
      }
    } else {
      setData('csvData', []);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData(e.target.name, e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setLog(null);
    setIsSubmitting(true);
    e.preventDefault();
    try {
      // APIへPOSTリクエストを送る
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: formData.host,
          site_id: formData.siteId,
          site_pass: formData.sitePass,
          member_id: formData.csvData
        }),
      });

      localStorage.setItem("GMOHost", formData.host);
      localStorage.setItem("GMOSiteId", formData.siteId);
      localStorage.setItem("GMOSitePass", formData.sitePass);

      // レスポンスをJSONとしてパース
      const data = await response.json();

      setLog(data);
    } catch (error) {
      console.error('Error submitting form:', error);
      setLog('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (log) {
      const logString = JSON.stringify(log, null, 2); // オブジェクトをJSON文字列に変換
      navigator.clipboard.writeText(logString)
        .then(() => {
          console.log('ログをクリップボードにコピーしました');
        })
        .catch((err) => {
          console.error('クリップボードにコピーできませんでした:', err);
        });
    } else {
      console.log('コピーするログがありません');
    }
  };

  useEffect(() => {
    const host = localStorage.getItem("GMOHost") || '';
    const siteId = localStorage.getItem("GMOSiteId") || '';
    const sitePass = localStorage.getItem("GMOSitePass") || '';

    const hostElm = document.getElementById('host') as HTMLInputElement;
    if(hostElm) {
      hostElm.value = host;
    }
    const siteIdElm = document.getElementById('site_id') as HTMLInputElement;
    if(siteIdElm) {
      siteIdElm.value = siteId;
    }
    const sitePassElm = document.getElementById('site_pass') as HTMLInputElement;
    if(sitePassElm) {
      sitePassElm.value = sitePass;
    }

    setFormData({
      ...formData,
      host: host,
      siteId: siteId,
      sitePass: sitePass
    });
  }, []);

  useEffect(() => {
    const newErrors: FormErrors = {};

    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof typeof formData];
      if (value.length === 0) {
        newErrors[key as keyof FormErrors] = '必須項目です。';
      }
    });

    setErrors(newErrors);
  }, [formData]);

  useEffect(() => {
    const isThereAnyError = Object.values(errors).some((error) => error !== '');
    setIsDisableButton(isThereAnyError);
    if(errors.csvData?.length) {
      setFileName('');
    }
  }, [errors]);

  return (
    <>
      <div className="progress cal s12">
        <div className="determinate light-blue"></div>
      </div>
      <div className="container mb-5">
        <div className="row">
          <form  className="col s12">
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
                <label htmlFor="host">host</label>
                <span className="helper-text red-text">{errors.host}</span>
              </div>
            </div>
            <div className="row">
              <div className="input-field col s6">
                <input onChange={handleChange} id="site_id" name="siteId" type="text"/>
                <label htmlFor="site_id">site_id</label>
                <span className="helper-text red-text">{errors.siteId}</span>
              </div>
              <div className="input-field col s6">
                <input onChange={handleChange} id="site_pass" name="sitePass" type="password"/>
                <label htmlFor="site_pass">site_pass</label>
                <span className="helper-text red-text">{errors.sitePass}</span>
              </div>
            </div>

            <button type="submit" disabled={isDisableButton || isSubmitting} onClick={handleSubmit} className="col s2 light-blue darken-4 hoverable waves-effect waves-light btn-large" style={{'float': 'right'}}>
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
