import { CircularProgress } from "@mui/material"
import Modal from "../modal/modal"

export default function FullScreenLoader() {
  return (
    <Modal
      loader
    >
      <CircularProgress
        sx={{
          color: 'rgb(23, 89, 140)',
        }}
      />
    </Modal>
  )
}