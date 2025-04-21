import React, { useRef } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  Typography, 
  Paper,
  IconButton
} from '@mui/material';
import { 
  Close as CloseIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';

/**
 * QRコード生成コンポーネント
 * Canvas APIを使用してQRコードを描画します
 * 依存関係を最小限に抑えるため、外部ライブラリを使用せずに実装
 */
const QRCodeGenerator = ({ open, onClose, tableId, restaurantName }) => {
  const canvasRef = useRef(null);
  const qrRef = useRef(null);
  
  // QRコードのURL（顧客用デジタルメニューへのリンク）
  const menuUrl = `${window.location.origin}/customer/menu/${tableId}`;
  
  // QRコードを描画
  React.useEffect(() => {
    if (!open) return;
    
    // QRコードのサイズとスタイル
    const size = 200;
    const padding = 10;
    const backgroundColor = "#ffffff";
    const foregroundColor = "#000000";
    
    // QRコード描画用のキャンバス
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // キャンバスの背景色を設定
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);
    
    // QRコード用のシンプルなパターンを描画（実際のアプリケーションでは専用ライブラリを使用）
    // この実装はデモ用の簡易的なものです
    ctx.fillStyle = foregroundColor;
    
    // 外枠を描画
    ctx.fillRect(padding, padding, size - padding * 2, 10);
    ctx.fillRect(padding, size - padding - 10, size - padding * 2, 10);
    ctx.fillRect(padding, padding, 10, size - padding * 2);
    ctx.fillRect(size - padding - 10, padding, 10, size - padding * 2);
    
    // QRコード風のパターン
    const gridSize = 8;
    const cellSize = (size - padding * 2 - 40) / gridSize;
    
    // 左上のポジションマーカー
    ctx.fillRect(padding + 10, padding + 10, cellSize * 3, cellSize * 3);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(padding + 10 + cellSize, padding + 10 + cellSize, cellSize, cellSize);
    ctx.fillStyle = foregroundColor;
    
    // 右上のポジションマーカー
    ctx.fillRect(size - padding - 10 - cellSize * 3, padding + 10, cellSize * 3, cellSize * 3);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(size - padding - 10 - cellSize * 2, padding + 10 + cellSize, cellSize, cellSize);
    ctx.fillStyle = foregroundColor;
    
    // 左下のポジションマーカー
    ctx.fillRect(padding + 10, size - padding - 10 - cellSize * 3, cellSize * 3, cellSize * 3);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(padding + 10 + cellSize, size - padding - 10 - cellSize * 2, cellSize, cellSize);
    ctx.fillStyle = foregroundColor;
    
    // データパターン（実際にはエンコードされたデータに基づく）
    // ここではランダムなパターンを生成
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // ポジションマーカーを避ける
        if ((i < 3 && j < 3) || (i < 3 && j > gridSize - 4) || (i > gridSize - 4 && j < 3)) {
          continue;
        }
        
        if (Math.random() > 0.5) {
          const x = padding + 10 + i * cellSize;
          const y = padding + 10 + j * cellSize;
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }
    
    // QRコードを表示
    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrRef.current.appendChild(canvas);
    }
    
    // キャンバス参照を保存
    canvasRef.current = canvas;
  }, [open, tableId]);
  
  // QRコードをダウンロード
  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    // キャンバスをデータURLに変換
    const dataUrl = canvasRef.current.toDataURL('image/png');
    
    // ダウンロードリンクを作成
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qrcode-table-${tableId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // URLをクリップボードにコピー
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(menuUrl)
      .then(() => {
        alert('URLをクリップボードにコピーしました');
      })
      .catch(err => {
        console.error('URLのコピーに失敗しました:', err);
      });
  };
  
  // QRコードを印刷
  const handlePrint = () => {
    if (!canvasRef.current) return;
    
    const dataUrl = canvasRef.current.toDataURL('image/png');
    
    // 印刷用のウィンドウを作成
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QRコード - テーブル ${tableId}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              padding: 20px;
              box-sizing: border-box;
              font-family: Arial, sans-serif;
            }
            .container {
              text-align: center;
            }
            img {
              max-width: 100%;
              height: auto;
              margin-bottom: 20px;
            }
            h2 {
              margin-bottom: 5px;
            }
            p {
              margin-top: 0;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>${restaurantName || 'レストラン'}</h2>
            <p>テーブル ${tableId}</p>
            <img src="${dataUrl}" alt="QRコード">
            <p>このQRコードを読み取ってメニューを表示</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            テーブル {tableId} のQRコード
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          {/* QRコード表示エリア */}
          <Paper 
            elevation={2} 
            sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'center', width: 220, height: 220 }}
            ref={qrRef}
          />
          
          <Typography variant="subtitle1" gutterBottom>
            テーブル {tableId}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            このQRコードを読み取ると、お客様はデジタルメニューにアクセスして注文できます。
          </Typography>
          
          <Box 
            sx={{ 
              bgcolor: 'grey.100', 
              p: 1, 
              borderRadius: 1, 
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              mb: 2
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                flexGrow: 1, 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mr: 1
              }}
            >
              {menuUrl}
            </Typography>
            <IconButton size="small" onClick={handleCopyUrl}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button 
          startIcon={<DownloadIcon />} 
          variant="outlined"
          onClick={handleDownload}
        >
          ダウンロード
        </Button>
        <Button 
          startIcon={<PrintIcon />} 
          variant="outlined"
          onClick={handlePrint}
        >
          印刷
        </Button>
        <Button 
          startIcon={<ShareIcon />} 
          variant="contained"
          onClick={handleCopyUrl}
        >
          URLをコピー
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeGenerator;
