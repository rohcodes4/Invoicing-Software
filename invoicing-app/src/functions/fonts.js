import { Font } from '@react-pdf/renderer';
import NotoSans from '../assets/fonts/NotoSans.ttf';

Font.register({
  family: 'Noto Sans',
  fonts: [
    { src: NotoSans, fontWeight: 'normal', fontStyle:'' },
    { src: NotoSans, fontWeight: 'bold' },
  ],
});
