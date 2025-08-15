import { PDFDocument, rgb, StandardFonts, PDFFont, PageSizes, type Color } from 'pdf-lib';
import { type ConsultaPreviaDetalhe } from '../../services/cpv';


const COLORS = {
  PRIMARY: rgb(0.12, 0.38, 0.53),
  SECONDARY: rgb(0.2, 0.2, 0.2),
  LIGHT_GRAY: rgb(0.85, 0.85, 0.85),
  WHITE: rgb(1, 1, 1),
  SUCCESS: rgb(0.15, 0.68, 0.38),
  ERROR: rgb(0.75, 0.22, 0.17),
  WARNING: rgb(1, 0.76, 0.03),
};

const MARGINS = {
  TOP: 50,
  BOTTOM: 50,
  LEFT: 50,
  RIGHT: 50,
};

const FONT_SIZES = {
  TITLE: 20,
  SUBTITLE: 14,
  BODY: 10,
  LABEL: 9,
};

class ReportGenerator {
  private pdfDoc!: PDFDocument;
  private consulta: ConsultaPreviaDetalhe;
  private page!: any;
  private y!: number;
  private fonts!: { regular: PDFFont; bold: PDFFont };
  private pageHeight!: number;

  constructor(consulta: ConsultaPreviaDetalhe) {
    this.consulta = consulta;
  }

  public async generate(): Promise<Uint8Array> {
    await this.setup();
    await this.drawContent();
    await this.drawFooter();
    return this.pdfDoc.save();
  }

  private async setup() {
    this.pdfDoc = await PDFDocument.create();
    this.fonts = {
      regular: await this.pdfDoc.embedFont(StandardFonts.Helvetica),
      bold: await this.pdfDoc.embedFont(StandardFonts.HelveticaBold),
    };
    this.addNewPage();
  }

  private addNewPage() {
    this.page = this.pdfDoc.addPage(PageSizes.A4);
    this.pageHeight = this.page.getSize().height;
    this.y = this.pageHeight - MARGINS.TOP;
    this.drawHeader();
  }

  private async drawHeader() {
    try {
      const logoUrl = 'https://i.imgur.com/J2gU333.png';
      const logoBytes = await fetch(logoUrl).then(res => res.arrayBuffer());
      const logoImage = await this.pdfDoc.embedPng(logoBytes);
      const logoDims = logoImage.scale(0.08);

      this.page.drawImage(logoImage, {
        x: MARGINS.LEFT,
        y: this.pageHeight - MARGINS.TOP + 10,
        width: logoDims.width,
        height: logoDims.height,
      });
    } catch (e) {
      console.error("Não foi possível carregar o logo:", e);
    }

    this.page.drawText('PREFEITURA MUNICIPAL DE CRUZ MACHADO', {
      x: MARGINS.LEFT + 60,
      y: this.pageHeight - MARGINS.TOP + 5,
      font: this.fonts.bold,
      size: 12,
      color: COLORS.SECONDARY,
    });
  }

  private async drawFooter() {
    const pages = this.pdfDoc.getPages();
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageNumberText = `Página ${i + 1} de ${pages.length}`;
      const genDateText = `Gerado em: ${new Date().toLocaleString('pt-BR')}`;

      page.drawText(genDateText, {
        x: MARGINS.LEFT,
        y: MARGINS.BOTTOM - 20,
        font: this.fonts.regular,
        size: 8,
        color: COLORS.LIGHT_GRAY,
      });

      page.drawText(pageNumberText, {
        x: page.getWidth() - MARGINS.RIGHT - this.fonts.regular.widthOfTextAtSize(pageNumberText, 8),
        y: MARGINS.BOTTOM - 20,
        font: this.fonts.regular,
        size: 8,
        color: COLORS.LIGHT_GRAY,
      });
    }
  }

  private checkAndAddNewPage(requiredHeight: number) {
    if (this.y - requiredHeight < MARGINS.BOTTOM) {
      this.addNewPage();
    }
  }

  private drawSectionTitle(text: string) {
    this.checkAndAddNewPage(40);
    this.y -= 25;
    this.page.drawLine({
      start: { x: MARGINS.LEFT, y: this.y + 5 },
      end: { x: this.page.getWidth() - MARGINS.RIGHT, y: this.y + 5 },
      thickness: 0.5,
      color: COLORS.LIGHT_GRAY,
    });
    this.y -= 20;
    this.page.drawText(text, {
      x: MARGINS.LEFT,
      y: this.y,
      font: this.fonts.bold,
      size: FONT_SIZES.SUBTITLE,
      color: COLORS.PRIMARY,
    });
    this.y -= 20;
  }

  private drawField(label: string, value: string | null | undefined, options?: { valueColor?: Color }) {
    this.checkAndAddNewPage(15);
    const cleanValue = value || 'Não informado';

    this.page.drawText(`${label}:`, {
      x: MARGINS.LEFT,
      y: this.y,
      font: this.fonts.bold,
      size: FONT_SIZES.LABEL,
      color: COLORS.SECONDARY,
    });

    this.page.drawText(cleanValue, {
      x: MARGINS.LEFT + 140,
      y: this.y,
      font: this.fonts.regular,
      size: FONT_SIZES.BODY,
      color: options?.valueColor || COLORS.SECONDARY,
    });
    this.y -= 18;
  }

  private drawWrappedText(label: string, text: string) {
    const maxWidth = this.page.getWidth() - MARGINS.LEFT - MARGINS.RIGHT - 140;
    const lines = this.splitTextIntoLines(text, maxWidth, this.fonts.regular, FONT_SIZES.BODY);

    this.checkAndAddNewPage(lines.length * 15);
    this.drawField(label, lines[0] || '');
    for (let i = 1; i < lines.length; i++) {
      this.page.drawText(lines[i], {
        x: MARGINS.LEFT + 140,
        y: this.y,
        font: this.fonts.regular,
        size: FONT_SIZES.BODY,
        color: COLORS.SECONDARY,
      });
      this.y -= 15;
    }
  }

  private splitTextIntoLines(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
    const lines: string[] = [];
    let currentLine = '';
    const words = text.split(' ');

    for (const word of words) {
      const testLine = currentLine.length > 0 ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width < maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  private drawStatusBadge() {
    const status = this.consulta.situacao.toUpperCase();
    let color = COLORS.WARNING;
    if (status === 'DEFERIDO') color = COLORS.SUCCESS;
    if (status === 'INDEFERIDO') color = COLORS.ERROR;

    const textWidth = this.fonts.bold.widthOfTextAtSize(status, FONT_SIZES.BODY);
    this.page.drawRectangle({
      x: this.page.getWidth() - MARGINS.RIGHT - textWidth - 20,
      y: this.y + 15,
      width: textWidth + 20,
      height: 20,
      color: color,
      borderRadius: 5,
    });
    this.page.drawText(status, {
      x: this.page.getWidth() - MARGINS.RIGHT - textWidth - 10,
      y: this.y + 21,
      font: this.fonts.bold,
      size: FONT_SIZES.BODY,
      color: COLORS.WHITE,
    });
  }

  private async drawContent() {
    this.y -= 30;
    this.page.drawText('Relatório de Consulta Prévia de Viabilidade', {
      x: MARGINS.LEFT,
      y: this.y,
      font: this.fonts.bold,
      size: FONT_SIZES.TITLE,
      color: COLORS.SECONDARY,
    });
    this.drawStatusBadge();

    this.drawSectionTitle('Dados da Solicitação e Empresa');
    this.drawField('Protocolo REDESIM', this.consulta.co_protocolo_redesim);
    this.drawField('CNPJ', this.consulta.nu_cnpj);
    this.drawField('Data da Solicitação', new Date(this.consulta.dt_solicitacao).toLocaleString('pt-BR'));
    this.drawField('Natureza Jurídica', this.consulta.co_natureza_juridica);
    this.drawWrappedText('Objeto Social', this.consulta.ds_objeto_social || '');

    this.drawSectionTitle('Endereço da Atividade');
    this.drawField('Endereço', `${this.consulta.endereco.ds_tipo_logradouro} ${this.consulta.endereco.ds_endereco}, ${this.consulta.endereco.nu_numero}`);
    this.drawField('Bairro', this.consulta.endereco.ds_bairro);
    this.drawField('CEP', this.consulta.endereco.co_cep);
    this.drawField('Inscrição Imobiliária', this.consulta.endereco.natureza_imovel.nu_inscricao);
    this.drawField('Área Utilizada', `${this.consulta.endereco.nu_area_utilizada} m²`);

    this.drawSectionTitle('Quadro Societário');
    this.consulta.socios.forEach(socio => {
      this.drawField(socio.ds_nome, `CPF/CNPJ: ${socio.nu_cpf_cnpj}`);
    });

    this.drawSectionTitle('Análise e Resultado');
    this.drawField('Classificação de Risco', this.consulta.classificacao_risco.ds_tipo_risco);
    this.drawField('Zoneamento', this.consulta.zoneamento?.nome);
    this.drawWrappedText('Observações', this.consulta.observacoes || 'Nenhuma.');
  }
}

export async function generateReport(consulta: ConsultaPreviaDetalhe) {
  const reportGenerator = new ReportGenerator(consulta);
  const pdfBytes = await reportGenerator.generate();

  const arrayBuffer = new Uint8Array(pdfBytes).buffer;
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `consulta-previa-${consulta.co_protocolo_redesim}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}