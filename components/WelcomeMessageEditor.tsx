"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { EditOutlined, SaveOutlined } from "@mui/icons-material";

export default function WelcomeMessageEditor() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const close = () => {
    setOpen(false);
    setMessage("");
  };

  const handleSave = () => {
    const value = message.trim();
    if (!value) return;
    localStorage.setItem("welcome-message", value);
    // Notify other components
    window.dispatchEvent(new CustomEvent("welcome-message-updated", { detail: { message: value } }));
    close();
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<EditOutlined />}
        onClick={() => setOpen(true)}
        sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", "&:hover": { bgcolor: "rgba(255,255,255,0.28)" }, flexShrink: 0 }}
      >
        Modifier le message du trimestre
      </Button>

      <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
        <DialogTitle>Modifier le message du trimestre</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            margin="dense"
            label="Nouveau message du trimestre"
            placeholder="Entrez le nouveau message du trimestre..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 200 } }}
            helperText={`${message.length}/200 caractères`}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={close}>Annuler</Button>
          <Button variant="contained" startIcon={<SaveOutlined />} onClick={handleSave} disabled={!message.trim()}>
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
