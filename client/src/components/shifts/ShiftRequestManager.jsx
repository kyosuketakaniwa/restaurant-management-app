import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Collapse,
  Alert
} from '@mui/material';
import moment from 'moment';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useShift } from '../../contexts/ShiftContext';
import { useStaff } from '../../contexts/StaffContext';

const ShiftRequestManager = ({ staffId = null }) => {
  const { shiftRequests, createShiftRequest, approveShiftRequest, rejectShiftRequest, shifts } = useShift();
  const { staff, getStaffById } = useStaff();
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('view'); // view, approve, reject
  const [rejectReason, setRejectReason] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [alert, setAlert] = useState({ show: false, severity: 'success', message: '' });

  // スタッフのリクエストをフィルタリング
  const filteredRequests = staffId 
    ? shiftRequests.filter(req => req.staffId === staffId)
    : shiftRequests;

  // リクエストカードの展開/折りたたみを管理
  const toggleCardExpand = (requestId) => {
    setExpandedCards(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

  // リクエスト詳細ダイアログを表示
  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setDialogMode('view');
    setShowDialog(true);
  };

  // 承認ダイアログを表示
  const handleApproveDialog = (request) => {
    setSelectedRequest(request);
    setDialogMode('approve');
    setShowDialog(true);
  };

  // 拒否ダイアログを表示
  const handleRejectDialog = (request) => {
    setSelectedRequest(request);
    setDialogMode('reject');
    setRejectReason('');
    setShowDialog(true);
  };

  // リクエスト承認処理
  const handleApproveRequest = () => {
    try {
      approveShiftRequest(selectedRequest.id);
      setShowDialog(false);
      setAlert({
        show: true,
        severity: 'success',
        message: 'シフト交代リクエストを承認しました'
      });
    } catch (error) {
      console.error('シフト交代リクエストの承認に失敗しました', error);
      setAlert({
        show: true,
        severity: 'error',
        message: 'シフト交代リクエストの承認に失敗しました'
      });
    }
  };

  // リクエスト拒否処理
  const handleRejectRequest = () => {
    try {
      rejectShiftRequest(selectedRequest.id);
      setShowDialog(false);
      setAlert({
        show: true,
        severity: 'success',
        message: 'シフト交代リクエストを拒否しました'
      });
    } catch (error) {
      console.error('シフト交代リクエストの拒否に失敗しました', error);
      setAlert({
        show: true,
        severity: 'error',
        message: 'シフト交代リクエストの拒否に失敗しました'
      });
    }
  };

  // リクエストタイプに基づいたアイコンとラベルを返す
  const getRequestTypeInfo = (requestType) => {
    switch(requestType) {
      case 'swap':
        return { 
          icon: <SwapHorizIcon />,
          label: 'シフト交代',
          color: 'primary' 
        };
      case 'time_change':
        return { 
          icon: <AccessTimeIcon />, 
          label: '時間変更',
          color: 'secondary' 
        };
      case 'day_off':
        return { 
          icon: <EventBusyIcon />, 
          label: '休暇申請',
          color: 'error' 
        };
      default:
        return { 
          icon: <SwapHorizIcon />, 
          label: 'その他',
          color: 'default' 
        };
    }
  };

  // リクエストステータスに基づいたチップを返す
  const getStatusChip = (status) => {
    switch(status) {
      case 'approved':
        return (
          <Chip 
            icon={<CheckCircleIcon />} 
            label="承認済" 
            color="success" 
            size="small" 
          />
        );
      case 'rejected':
        return (
          <Chip 
            icon={<CancelIcon />} 
            label="拒否" 
            color="error" 
            size="small" 
          />
        );
      case 'pending':
      default:
        return (
          <Chip 
            label="未処理" 
            color="warning" 
            size="small" 
            variant="outlined" 
          />
        );
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          シフト交代リクエスト
          {staffId && getStaffById(staffId) && (
            <span> - {getStaffById(staffId).name}</span>
          )}
        </Typography>
        
        <Collapse in={alert.show}>
          <Alert 
            severity={alert.severity}
            onClose={() => setAlert({ ...alert, show: false })}
            sx={{ mb: 2 }}
          >
            {alert.message}
          </Alert>
        </Collapse>
        
        {filteredRequests.length === 0 ? (
          <Typography color="text.secondary" sx={{ my: 4, textAlign: 'center' }}>
            シフト交代リクエストはありません
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {filteredRequests.map((request) => {
              const typeInfo = getRequestTypeInfo(request.requestType);
              const isExpanded = expandedCards[request.id] || false;
              
              return (
                <Grid item xs={12} md={6} key={request.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            icon={typeInfo.icon} 
                            label={typeInfo.label} 
                            color={typeInfo.color} 
                            size="small" 
                            sx={{ mr: 1 }}
                          />
                          {getStatusChip(request.requestStatus)}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {moment(request.requestDate).format('YYYY/MM/DD HH:mm')}
                        </Typography>
                      </Box>
                      
                      <Typography variant="h6" gutterBottom>
                        {request.staffName}
                      </Typography>
                      
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">対象シフト日</Typography>
                          <Typography variant="body2">
                            {moment(request.originalShift.date).format('YYYY/MM/DD')}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">シフト時間</Typography>
                          <Typography variant="body2">
                            {moment(request.originalShift.startTime).format('HH:mm')} - 
                            {moment(request.originalShift.endTime).format('HH:mm')}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        理由: {request.reason}
                      </Typography>
                      
                      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => toggleCardExpand(request.id)}
                          sx={{ 
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.3s'
                          }}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                        
                        <Box>
                          {request.requestStatus === 'pending' && (
                            <>
                              <Button 
                                size="small" 
                                variant="outlined" 
                                color="error"
                                onClick={() => handleRejectDialog(request)}
                                sx={{ mr: 1 }}
                              >
                                拒否
                              </Button>
                              <Button 
                                size="small" 
                                variant="contained" 
                                color="success"
                                onClick={() => handleApproveDialog(request)}
                              >
                                承認
                              </Button>
                            </>
                          )}
                          {request.requestStatus !== 'pending' && (
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => handleViewRequest(request)}
                            >
                              詳細
                            </Button>
                          )}
                        </Box>
                      </Box>
                      
                      <Collapse in={isExpanded}>
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                          {request.requestType === 'swap' && (
                            <>
                              <Typography variant="subtitle2">シフト交代内容</Typography>
                              <Grid container spacing={1}>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">交代相手</Typography>
                                  <Typography variant="body2">
                                    {staff.find(s => s.id === request.proposedChanges.targetStaffId)?.name || '未定'}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </>
                          )}
                          
                          {request.requestType === 'time_change' && (
                            <>
                              <Typography variant="subtitle2">時間変更内容</Typography>
                              <Grid container spacing={1}>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">現在の時間</Typography>
                                  <Typography variant="body2">
                                    {moment(request.originalShift.startTime).format('HH:mm')} - 
                                    {moment(request.originalShift.endTime).format('HH:mm')}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">希望時間</Typography>
                                  <Typography variant="body2">
                                    {moment(request.proposedChanges.newStartTime).format('HH:mm')} - 
                                    {moment(request.proposedChanges.newEndTime).format('HH:mm')}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </>
                          )}
                          
                          {request.requestType === 'day_off' && (
                            <>
                              <Typography variant="subtitle2">休暇申請内容</Typography>
                              <Typography variant="body2" color="text.secondary">
                                この日のシフトを休暇に変更します
                              </Typography>
                            </>
                          )}
                          
                          {request.notes && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">備考</Typography>
                              <Typography variant="body2">{request.notes}</Typography>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Paper>
      
      {/* リクエスト詳細/承認/拒否ダイアログ */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'view' && 'シフト交代リクエスト詳細'}
          {dialogMode === 'approve' && 'シフト交代リクエスト承認'}
          {dialogMode === 'reject' && 'シフト交代リクエスト拒否'}
          <IconButton
            aria-label="close"
            onClick={() => setShowDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <span>&times;</span>
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">リクエスト者</Typography>
                  <Typography variant="body1">{selectedRequest.staffName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">リクエスト日時</Typography>
                  <Typography variant="body1">
                    {moment(selectedRequest.requestDate).format('YYYY/MM/DD HH:mm')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">リクエストタイプ</Typography>
                  <Typography variant="body1">
                    {getRequestTypeInfo(selectedRequest.requestType).label}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">理由</Typography>
                  <Typography variant="body1">{selectedRequest.reason}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle1" gutterBottom>元のシフト情報</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">日付</Typography>
                  <Typography variant="body1">
                    {moment(selectedRequest.originalShift.date).format('YYYY/MM/DD')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">時間</Typography>
                  <Typography variant="body1">
                    {moment(selectedRequest.originalShift.startTime).format('HH:mm')} - 
                    {moment(selectedRequest.originalShift.endTime).format('HH:mm')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle1" gutterBottom>リクエスト内容</Typography>
                </Grid>
                
                {selectedRequest.requestType === 'swap' && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">交代希望スタッフ</Typography>
                    <Typography variant="body1">
                      {staff.find(s => s.id === selectedRequest.proposedChanges.targetStaffId)?.name || '未定'}
                    </Typography>
                  </Grid>
                )}
                
                {selectedRequest.requestType === 'time_change' && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">新しい開始時間</Typography>
                      <Typography variant="body1">
                        {moment(selectedRequest.proposedChanges.newStartTime).format('HH:mm')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">新しい終了時間</Typography>
                      <Typography variant="body1">
                        {moment(selectedRequest.proposedChanges.newEndTime).format('HH:mm')}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                {selectedRequest.requestType === 'day_off' && (
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      このシフトを休暇に変更します
                    </Typography>
                  </Grid>
                )}
                
                {selectedRequest.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">備考</Typography>
                    <Typography variant="body1">{selectedRequest.notes}</Typography>
                  </Grid>
                )}
                
                {selectedRequest.requestStatus !== 'pending' && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">ステータス</Typography>
                    <Box sx={{ mt: 1 }}>
                      {getStatusChip(selectedRequest.requestStatus)}
                    </Box>
                  </Grid>
                )}
                
                {dialogMode === 'reject' && (
                  <Grid item xs={12}>
                    <TextField
                      label="拒否理由"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      multiline
                      rows={3}
                      fullWidth
                      margin="normal"
                    />
                  </Grid>
                )}
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {dialogMode === 'view' && (
            <Button onClick={() => setShowDialog(false)}>閉じる</Button>
          )}
          
          {dialogMode === 'approve' && (
            <>
              <Button onClick={() => setShowDialog(false)} color="inherit">キャンセル</Button>
              <Button onClick={handleApproveRequest} color="success" variant="contained">
                承認する
              </Button>
            </>
          )}
          
          {dialogMode === 'reject' && (
            <>
              <Button onClick={() => setShowDialog(false)} color="inherit">キャンセル</Button>
              <Button onClick={handleRejectRequest} color="error" variant="contained">
                拒否する
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftRequestManager;
