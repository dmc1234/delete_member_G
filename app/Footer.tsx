import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="page-footer light-blue darken-4">
      <div className="container">
        <div className="row">
          <div className="col l6 s12">
            <h5 className="white-text">GMOリンク</h5>
          </div>
          <div className="col l4 offset-l2 s12">
            <h5 className="white-text">エラーコード</h5>
            <ul>
              <li><a className="grey-text text-lighten-3" target="_blank"
                     href="https://mp-faq.gmo-pg.com/s/article/D00874">E系（E00-E01）</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
