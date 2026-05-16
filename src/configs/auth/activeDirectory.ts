import ActiveDirectory from 'activedirectory';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  url: process.env.AD_URL || '',
  baseDN: process.env.DOMAIN_CONTROLLER || '',
};

const ad = new ActiveDirectory(config);

export default ad;