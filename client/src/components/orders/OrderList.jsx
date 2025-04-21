import React from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, Typography, Box, TablePagination, IconButton
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  AttachMoney as PaymentIcon,
  RestaurantMenu as FoodIcon
} from '@mui/icons-material';

/**
 * 注文リストコンポーネント
 * @param {Object} props
 * @param {Array} props.orders 注文リスト
 * @param {Function} props.onOrderSelect 注文選択時のコールバック
 * @param {Function} props.getStatusDisplay ステータス表示用の関数
 */
const OrderList = ({ orders, onOrderSelect, getStatusDisplay }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // ページ変更ハンドラー
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // 1ページあたりの表示件数変更ハンドラー
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 注文アイテムの合計数を取得
  const getTotalItems = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // 日時のフォーマット
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ページネーションされた注文リスト
  const paginatedOrders = orders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
        <Table stickyHeader aria-label="注文リスト">
          <TableHead>
            <TableRow>
              <TableCell>注文番号</TableCell>
              <TableCell>注文日時</TableCell>
              <TableCell>顧客/テーブル</TableCell>
              <TableCell>商品数</TableCell>
              <TableCell>合計金額</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell>アクション</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => {
                const statusDisplay = getStatusDisplay(order.status);
                
                return (
                  <TableRow
                    key={order.id}
                    hover
                    onClick={() => onOrderSelect(order)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <FoodIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2">
                          {order.orderNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.customerName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {order.tableId ? `テーブル: ${order.tableId.replace('table-', '')}` : '持ち帰り'}
                      </Typography>
                    </TableCell>
                    <TableCell>{getTotalItems(order.items)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ¥{order.total.toLocaleString()}
                      </Typography>
                      {order.paid && (
                        <Box display="flex" alignItems="center">
                          <PaymentIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                          <Typography variant="caption" color="success.main">
                            支払い済み
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusDisplay.label}
                        color={statusDisplay.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOrderSelect(order);
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    注文データがありません
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={orders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="表示件数:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />
    </Paper>
  );
};

export default OrderList;
