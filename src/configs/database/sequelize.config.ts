import 'dotenv/config';

interface DatabaseConfig {
  username: string | undefined;
  password: string | undefined;
  database: string | undefined;
  host: string | undefined;
  port: number | undefined;
  dialect: 'mysql' | 'mssql';
  pool?: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
  logging: boolean;
  dialectOptions: {
    options?: {
      encrypt: boolean;
      enableArithAbort: boolean;
      requestTimeout: number;
      connectionTimeout: number;
      useUTC: boolean;
    };
    ssl: {
      require: boolean;
      rejectUnauthorized: boolean;
    };
  };
  operatorsAliases?: boolean;
}

const config: { [key: string]: DatabaseConfig } = {
  mysql: {
    username: process.env.MYSQL_DB_USER,
    password: process.env.MYSQL_DB_PASSWORD,
    database: process.env.MYSQL_DB_DATABASE,
    host: process.env.MYSQL_DB_HOST,
    port: process.env.MYSQL_DB_PORT
      ? parseInt(process.env.MYSQL_DB_PORT, 10)
      : 3306,
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  sqlserver: {
    username: process.env.SQLSERVER_DB_USER,
    password: process.env.SQLSERVER_DB_PASSWORD,
    database: process.env.SQLSERVER_DB_DATABASE,
    host: process.env.SQLSERVER_DB_HOST,
    port: process.env.SQLSERVER_DB_PORT
      ? parseInt(process.env.SQLSERVER_DB_PORT, 10)
      : 1433, // 1433 é a porta padrão para SQL Server
    dialect: 'mssql',
    pool: {
      max: 10, // Quantidade máxima de conexões no pool
      min: 0, // Quantidade mínima de conexões no pool
      acquire: 30000, // Tempo máximo de espera para adquirir uma conexão
      idle: 10000, // Tempo máximo que uma conexão pode ficar ociosa
    },
    logging: false, // Pode ser true para debug durante o desenvolvimento
    dialectOptions: {
      options: {
        encrypt: false, // Para testes, pode ser False. Use True se o banco exigir criptografia SSL
        enableArithAbort: true, // Recomendado para evitar problemas com operações matemáticas
        requestTimeout: 300000, // Timeout para requisições individuais (em ms)
        connectionTimeout: 30000, // Timeout para conectar-se ao banco de dados (em ms)
        useUTC: false, // Usado para garantir que o SQL Server use o horário local (não UTC)
      },
      ssl: {
        require: false, // Em ambiente de teste, você pode desabilitar o SSL
        rejectUnauthorized: false, // Pode ser false para não rejeitar certificados SSL não verificados
      },
    },
  },
  mysqlsap: {
    username: process.env.MYSQL_SAP_USER,
    password: process.env.MYSQL_SAP_PASSWORD,
    database: process.env.MYSQL_SAP_DATABASE,
    host: process.env.MYSQL_SAP_HOST,
    port: process.env.MYSQL_SAP_PORT
      ? parseInt(process.env.MYSQL_SAP_PORT, 10)
      : 3306,
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};

export default config;
