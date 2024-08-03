import { styled } from "@mui/system";
import { Autocomplete } from "@mui/material";

const CustomAutocomplete = styled(Autocomplete)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#cfd1d4', // Normal state border color
      },
      '&:hover fieldset': {
        borderColor: '#2196F3', // Hover state border color
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2196F3', // Focused state border color
      },
    },
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'white', // Default background color
    },
    '& .MuiInputLabel-root': {
      color: '#cfd1d4', // Label color
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#3d89ff', // Focused label color
    },
  }));

  export default CustomAutocomplete;