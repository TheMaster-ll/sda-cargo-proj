import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, Paper, TablePagination, Box, Typography
} from '@mui/material';

export default function DataTable({ columns, rows, onRowClick, emptyMessage = 'No data found' }) {
  const [orderBy, setOrderBy] = useState('');
  const [orderDir, setOrderDir] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && orderDir === 'asc';
    setOrderDir(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  const sortedRows = [...(rows || [])].sort((a, b) => {
    if (!orderBy) return 0;
    const aVal = a[orderBy] ?? '';
    const bVal = b[orderBy] ?? '';
    if (aVal < bVal) return orderDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return orderDir === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (!rows || rows.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={(theme) => ({ bgcolor: theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc' })}>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.78rem', py: 1.5 }}
                  sortDirection={orderBy === col.id ? orderDir : false}
                  align={col.align || 'left'}
                >
                  {col.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? orderDir : 'asc'}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, idx) => (
              <TableRow
                key={row.id || idx}
                hover
                onClick={() => onRowClick && onRowClick(row)}
                sx={{ cursor: onRowClick ? 'pointer' : 'default', '&:last-child td': { borderBottom: 0 } }}
              >
                {columns.map((col) => (
                  <TableCell key={col.id} align={col.align || 'left'} sx={{ fontSize: '0.82rem', py: 1.2 }}>
                    {col.render ? col.render(row) : row[col.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {rows.length > 10 && (
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      )}
    </Paper>
  );
}
