import formidable from 'formidable';
import fs from 'fs';
import { Parser } from 'xml2js';

export const config = {
  api: {
    bodyParser: false,
  },
};

function formatDate(date) {
  const d = new Date(date);
  return d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') +
    String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0') +
    String(d.getSeconds()).padStart(2, '0');
}

function isValidDate(d) {
  const today = new Date();
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const day = d.getDay();
  return d < today && day !== 0 && day !== 6;
}

function convertSgmlToXml(content) {
  const startIndex = content.indexOf('<OFX>');
  if (startIndex === -1) return content;

  const sgmlBody = content.slice(startIndex);
  const lines = sgmlBody.split(/\r?\n/).map(line => {
    const match = line.match(/^<([^/][^>]*?)>([^<]+)$/);
    if (match) {
      const tag = match[1];
      const value = match[2];
      return `<${tag}>${value}</${tag}>`;
    }
    return line;
  });

  return lines.join('').replace(/&/g, '&amp;');
}

export default async function handler(req, res) {
  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).send('Erro ao fazer upload.');

    try {
      const uploaded = files.file?.[0];
      if (!uploaded) {
        return res.status(400).send('Arquivo não enviado');
      }

      let data = fs.readFileSync(uploaded.filepath, 'utf8').trim();
      if (!data.startsWith('<?xml')) {
        data = convertSgmlToXml(data);
      }

      const parser = new Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(data);

      const stmtrs = result.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS;
      const transactionsRaw = stmtrs.BANKTRANLIST.STMTTRN;
      const transactions = Array.isArray(transactionsRaw) ? transactionsRaw : [transactionsRaw];
      const validTxs = [];

      transactions.forEach((tx, i) => {
        const dateStr = tx.DTPOSTED?.split('[')[0];
        const date = new Date(
          dateStr.slice(0, 4),
          dateStr.slice(4, 6) - 1,
          dateStr.slice(6, 8),
          dateStr.slice(8, 10),
          dateStr.slice(10, 12),
          dateStr.slice(12, 14)
        );

        if (!isValidDate(date)) return;

        validTxs.push({
          type: tx.TRNTYPE || 'CREDIT',
          date,
          dateStr: formatDate(date),
          amount: parseFloat(tx.TRNAMT || '0.00').toFixed(2).replace('.', ','),
          fitid: tx.FITID || `N${i + 1}`,
          memo: (tx.MEMO || 'TRANSACAO').substring(0, 32),
          checknum: `${1000000 + i}`,
        });
      });

      const dates = validTxs.map(tx => tx.dateStr);
      const dtStart = dates.length ? dates.reduce((a, b) => (a < b ? a : b)) : formatDate(new Date());
      const dtEnd = dates.length ? dates.reduce((a, b) => (a > b ? a : b)) : formatDate(new Date());

      const ofxLines = [
        'OFXHEADER:100',
        'DATA:OFXSGML',
        'VERSION:102',
        'SECURITY:NONE',
        'ENCODING:USASCII',
        'CHARSET:1252',
        'COMPRESSION:NONE',
        'OLDFILEUID:NONE',
        'NEWFILEUID:NONE',
        '',
        '<OFX>',
        '<SIGNONMSGSRSV1>',
        '<SONRS>',
        '<STATUS>',
        '<CODE>0',
        '<SEVERITY>INFO',
        '</STATUS>',
        '<DTSERVER>00000000000000',
        '<LANGUAGE>POR',
        '</SONRS>',
        '</SIGNONMSGSRSV1>',
        '<BANKMSGSRSV1>',
        '<STMTTRNRS>',
        '<TRNUID>1001',
        '<STATUS>',
        '<CODE>0',
        '<SEVERITY>INFO',
        '</STATUS>',
        '<STMTRS>',
        '<CURDEF>BRL',
        '<BANKACCTFROM>',
        '<BANKID>0001',
        '<ACCTID>123456',
        '<ACCTTYPE>CHECKING',
        '</BANKACCTFROM>',
        '<BANKTRANLIST>',
        `<DTSTART>${dtStart}`,
        `<DTEND>${dtEnd}`,
        ...validTxs.map(tx => [
          '<STMTTRN>',
          `<TRNTYPE>${tx.type}`,
          `<DTPOSTED>${tx.dateStr}`,
          `<TRNAMT>${tx.amount}`,
          `<FITID>${tx.fitid}`,
          `<CHECKNUM>${tx.checknum}`,
          `<MEMO>${tx.memo}`,
          '</STMTTRN>',
        ].join('\r\n')),
        '</BANKTRANLIST>',
        '<LEDGERBAL>',
        '<BALAMT>0,00',
        '<DTASOF>00000000',
        '</LEDGERBAL>',
        '</STMTRS>',
        '</STMTTRNRS>',
        '</BANKMSGSRSV1>',
        '</OFX>'
      ];

      const output = ofxLines.join('\r\n');

      res.setHeader('Content-Type', 'application/ofx; charset=latin1');
      res.setHeader('Content-Disposition', 'attachment; filename="versao1.ofx"');
      return res.status(200).send(Buffer.from(output, 'latin1'));
    } catch (e) {
      console.error('❌ Erro ao processar OFX:', e.message);
      return res.status(500).send('Erro ao processar o arquivo OFX.');
    }
  });
}
