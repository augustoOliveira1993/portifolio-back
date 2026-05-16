import { Sequelize } from 'sequelize';
import config from './sequelize.config';
import { logger } from '@shared/utils/logger';

// Variáveis para armazenar as instâncias do Sequelize
let mysqlSequelize: Sequelize;
let mysqlsapSequelize: Sequelize;
let sqlServerSequelize: Sequelize;

// Função para obter e verificar a instância do Sequelize para o MySQL
export const getMySQLConnection = async (): Promise<Sequelize | null> => {
  if (!mysqlSequelize) {
    const mysqlConfig = config.mysql;
    mysqlSequelize = new Sequelize(
      mysqlConfig.database as string,
      mysqlConfig.username as string,
      mysqlConfig.password as string,
      {
        host: mysqlConfig.host,
        port: mysqlConfig.port,
        dialect: mysqlConfig.dialect,
        pool: mysqlConfig.pool,
        logging: mysqlConfig.logging,
        dialectOptions: mysqlConfig.dialectOptions,
      },
    );
  }
  try {
    await mysqlSequelize.authenticate(); // Garante que a conexão está ativa
  } catch (error) {
    console.error('Erro ao conectar ao MySQL:', error);
  }
  return mysqlSequelize;
};

// Função para obter e verificar a instância do Sequelize para o MySQL
export const getMySQLSAPConnection = async (): Promise<Sequelize | null> => {
  if (!mysqlsapSequelize) {
    const mysqlConfig = config.mysqlsap;
    mysqlsapSequelize = new Sequelize(
      mysqlConfig.database as string,
      mysqlConfig.username as string,
      mysqlConfig.password as string,
      {
        host: mysqlConfig.host,
        port: mysqlConfig.port,
        dialect: mysqlConfig.dialect,
        pool: mysqlConfig.pool,
        logging: mysqlConfig.logging,
        dialectOptions: mysqlConfig.dialectOptions,
      },
    );
  }
  try {
    await mysqlsapSequelize.authenticate(); // Garante que a conexão está ativa
  } catch (error) {
    console.error('Erro ao conectar ao MySQLsap:', error);
  }
  return mysqlsapSequelize;
};

// Função para obter e verificar a instância do Sequelize para o SQL Server
export const getSQLServerConnection = async (): Promise<Sequelize> => {
  if (!sqlServerSequelize) {
    const sqlServerConfig = config.sqlserver;
    sqlServerSequelize = new Sequelize(
      sqlServerConfig.database as string,
      sqlServerConfig.username as string,
      sqlServerConfig.password as string,
      {
        host: sqlServerConfig.host,
        port: sqlServerConfig.port,
        dialect: sqlServerConfig.dialect,
        pool: sqlServerConfig.pool,
        logging: sqlServerConfig.logging,
        dialectOptions: sqlServerConfig.dialectOptions,
      },
    );
  }
  try {
    await sqlServerSequelize.authenticate(); // Garante que a conexão está ativa
  } catch (error) {
    logger.error('Erro ao conectar ao SQL Server:', error.message);
  }
  return sqlServerSequelize;
};
