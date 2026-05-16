import { IAprovadoRecrutamentoSolicitanteData } from '../../interfaces/IEmailTemplates';

export function aprovadoSolicitante(
  data: IAprovadoRecrutamentoSolicitanteData,
): string {
  return `
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Solicitação de Recrutamento Aprovada</title>
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
        'Segoe UI',
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
                    <td valign="middle" style="padding-right: 14px; width: 1%; white-space: nowrap;">
                      <img
                        src="https://avb.ferroeste.com.br:446/logo_avb_filled.png"
                        alt="Aço Verde do Brasil"
                        height="36"
                        style="display: block; border: 0; width: auto"
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
                        Solicitação Aprovada
                      </p>
                    </td>
                    <td align="right" valign="middle">
                      <span
                        style="
                          display: inline-block;
                          padding: 4px 10px;
                          background-color: #f0fdf4;
                          color: #166534;
                          font-size: 11px;
                          font-weight: 600;
                          border-radius: 9999px;
                          border: 1px solid #86efac;
                          letter-spacing: 0.02em;
                        "
                      >
                        Aprovado
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
                    color: #09090b;
                  "
                >
                  Olá, <strong>${data.nomeSolicitante || 'Solicitante'}</strong>
                </p>
                <p
                  style="
                    margin: 0 0 28px 0;
                    font-size: 14px;
                    color: #71717a;
                    line-height: 1.6;
                  "
                >
                  Sua solicitação de recrutamento foi aprovada com sucesso.
                </p>

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    background-color: #f4f4f5;
                    border-radius: 8px;
                    border: 1px solid #d7d7db;
                    margin-bottom: 24px;
                  "
                >
                  <tr>
                    <td style="padding: 20px 24px">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-bottom: 12px">
                            <p
                              style="
                                margin: 0 0 2px 0;
                                font-size: 11px;
                                font-weight: 600;
                                letter-spacing: 0.06em;
                                text-transform: uppercase;
                                color: #a1a1aa;
                              "
                            >
                              Posição
                            </p>
                            <p
                              style="
                                margin: 0;
                                font-size: 14px;
                                font-weight: 500;
                                color: #09090b;
                              "
                            >
                              ${data.posicao}
                            </p>
                          </td>
                        </tr>
                        ${
                          data.id_seq
                            ? `
                        <tr>
                          <td
                            style="
                              padding-bottom: 12px;
                              border-top: 1px solid #d7d7db;
                              padding-top: 12px;
                            "
                          >
                            <p
                              style="
                                margin: 0 0 2px 0;
                                font-size: 11px;
                                font-weight: 600;
                                letter-spacing: 0.06em;
                                text-transform: uppercase;
                                color: #a1a1aa;
                              "
                            >
                              ID da solicitação
                            </p>
                            <p
                              style="
                                margin: 0;
                                font-size: 14px;
                                font-weight: 500;
                                color: #09090b;
                                font-family: ui-monospace, Cascadia Code, monospace;
                              "
                            >
                              ${data.id_seq}
                            </p>
                          </td>
                        </tr>
                        `
                            : ''
                        }
                        ${
                          data.aprovadorEmail
                            ? `
                        <tr>
                          <td
                            style="
                              border-top: 1px solid #d7d7db;
                              padding-top: 12px;
                            "
                          >
                            <p
                              style="
                                margin: 0 0 2px 0;
                                font-size: 11px;
                                font-weight: 600;
                                letter-spacing: 0.06em;
                                text-transform: uppercase;
                                color: #a1a1aa;
                              "
                            >
                              Aprovado por
                            </p>
                            <p
                              style="
                                margin: 0;
                                font-size: 14px;
                                font-weight: 500;
                                color: #09090b;
                              "
                            >
                              ${data.aprovadorEmail}
                            </p>
                          </td>
                        </tr>
                        `
                            : ''
                        }
                      </table>
                    </td>
                  </tr>
                </table>

                ${
                  data.observacao
                    ? `
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
                          margin: 0 0 4px 0;
                          font-size: 11px;
                          font-weight: 600;
                          letter-spacing: 0.06em;
                          text-transform: uppercase;
                          color: #a1a1aa;
                        "
                      >
                        Observação
                      </p>
                      <p
                        style="
                          margin: 0;
                          font-size: 14px;
                          color: #3f3f46;
                          line-height: 1.65;
                        "
                      >
                        ${data.observacao}
                      </p>
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
