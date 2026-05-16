import { IAprovadoBacklogRhData } from '../../interfaces/IEmailTemplates';

export function aprovadoBacklogRh(data: IAprovadoBacklogRhData): string {
  return /*html*/ `
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nova Solicitação de Recrutamento</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      font-family:
        ui-sans-serif,
        system-ui,
        -apple-system,
        &quot;Segoe UI&quot;,
        sans-serif;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background-color: #ffffff; padding: 40px 16px"
    >
      <tr>
        <td align="center">
          <table
            width="560"
            cellpadding="0"
            cellspacing="0"
            style="
              background-color: #ffffff;
              border-radius: 12px;
              border: 1px solid #d7d7db;
              overflow: hidden;
            "
          >
            <tr>
              <td
                style="
                  padding: 28px 32px 24px 32px;
                  border-bottom: 1px solid #d7d7db;
                "
              >
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td
                      valign="middle"
                      style="
                        padding-right: 14px;
                        width: 1%;
                        white-space: nowrap;
                      "
                    >
                      <img
                        style="
                          width: auto;
                          height: 36px;
                          display: block;
                          border: 0;
                        "
                        src="https://avb.ferroeste.com.br:446/logo_avb_filled.png"
                        alt="Logo AVB"
                      />
                    </td>
                    <td valign="middle">
                      <p
                        style="
                          margin: 0 0 2px 0;
                          font-size: 11px;
                          font-weight: 600;
                          letter-spacing: 0.08em;
                          text-transform: uppercase;
                          color: #a1a1aa;
                        "
                      >
                        SIG-AVB: Recrutamento &amp; Seleção
                      </p>
                      <p
                        style="
                          margin: 0;
                          font-size: 18px;
                          font-weight: 600;
                          color: #09090b;
                          letter-spacing: -0.02em;
                        "
                      >
                        Atribuição de R&amp;S
                      </p>
                    </td>
                    <td align="right" valign="middle">
                      <span
                        style="
                          display: inline-block;
                          padding: 4px 10px;
                          background-color: #fef9c3;
                          color: #854d0e;
                          font-size: 11px;
                          font-weight: 600;
                          border-radius: 9999px;
                          border: 1px solid #fde047;
                          letter-spacing: 0.02em;
                        "
                      >
                        Ação necessária
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 28px 32px">
                <p
                  style="
                    margin: 0 0 6px 0;
                    font-size: 15px;
                    font-weight: 500;
                    color: #09090b;"
                >
                  Olá, <strong>Recursos Humanos</strong>
                </p>
                <p
                  style="
                    margin: 0 0 28px 0;
                    font-size: 14px;
                    color: #71717a;
                    line-height: 1.6;
                  "
                >
                  Foi realizada pelo gestor
                  <strong style="color: #09090b">${data.nome_gestor}</strong>
                  a solicitação de abertura de processo de Recrutamento e
                  Seleção para o
                  <strong style="color: #09090b">ID${data.id_seq}</strong>.
                </p>

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="margin-bottom: 28px"
                >
                  <tr>
                    <td
                      style="
                        border-left: 2px solid #678274;
                        padding: 4px 0 4px 16px;
                      "
                    >
                      <p
                        style="
                          margin: 0;
                          font-size: 14px;
                          color: #3f3f46;
                          line-height: 1.65;
                        "
                      >
                        Gestor de Recursos Humanos, é necessário direcionar um
                        <strong style="color: #09090b">Recrutador</strong> para
                        esta solicitação.
                      </p>
                    </td>
                  </tr>
                </table>

                ${
                  data.linkSistema
                    ? `
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <a
                        href="${data.linkSistema}"
                        style="
                          display: inline-block;
                          padding: 10px 24px;
                          background-color: #678274;
                          color: #fafafa;
                          text-decoration: none;
                          border-radius: 6px;
                          font-size: 13px;
                          font-weight: 500;
                          letter-spacing: 0.01em;
                          border: 1px solid #678274;
                        "
                      >
                        Acessar o sistema
                      </a>
                    </td>
                  </tr>
                </table>
                `
                    : ''
                }
              </td>
            </tr>

            <tr>
              <td
                style="
                  background-color: #f4f4f5;
                  padding: 16px 32px;
                  border-top: 1px solid #d7d7db;
                "
              >
                <p
                  style="
                    margin: 0;
                    font-size: 11px;
                    color: #a1a1aa;
                    text-align: center;
                    line-height: 1.6;
                  "
                >
                  E-mail automático do sistema de recrutamento &mdash; não
                  responda a esta mensagem.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}
