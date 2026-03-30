"use client";

import { Box, Typography, Paper, TextField, Button, Alert, Divider } from "@mui/material";

export default function SettingsAdminPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Clinic Settings</Typography>
      <Alert severity="info" sx={{ mb: 3 }}>Configure clinic information and system preferences.</Alert>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Clinic Information</Typography>
        <TextField fullWidth label="Clinic Name" defaultValue="Vet Clinic" sx={{ mb: 2 }} />
        <TextField fullWidth label="Phone" defaultValue="(555) 123-4567" sx={{ mb: 2 }} />
        <TextField fullWidth label="Email" defaultValue="info@vetclinic.com" sx={{ mb: 2 }} />
        <TextField fullWidth label="Address" multiline rows={2} sx={{ mb: 2 }} />
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>SMS Configuration</Typography>
        <TextField fullWidth label="Twilio Account SID" type="password" sx={{ mb: 2 }} />
        <TextField fullWidth label="Twilio Auth Token" type="password" sx={{ mb: 2 }} />
        <TextField fullWidth label="From Phone Number" placeholder="+1234567890" sx={{ mb: 2 }} />
        
        <Button variant="contained" sx={{ mt: 2 }}>Save Settings</Button>
      </Paper>
    </Box>
  );
}
