declare module 'activedirectory' {

  interface ADConfig {
    url: string;
    baseDN: string;
    username?: string;
    password?: string;
  }

  interface UserAttributes {
    cn: string;
    sn: string;
    mail: string;
    givenName: string;
    [key: string]: any;
  }

  class ActiveDirectory {
    constructor(config: ADConfig);

    authenticate(
      username: string,
      password: string,
      callback: (err: Error | null, auth: boolean) => void
    ): void;

    findUser(
      username: string,
      callback: (err: Error | null, user: UserAttributes | null) => void
    ): void;
  }

  export = ActiveDirectory
}
