"use client"
import Image from "next/image";
import { useState, useEffect } from "react"
import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, TextField, Autocomplete, Typography } from "@mui/material"
import { collection, doc, getDocs, getDoc, query, deleteDoc, setDoc, addDoc } from "firebase/firestore";
import { styled } from "@mui/system"

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

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [selectedItem, setSelectedItem] = useState("");

  const updateInventory = async() => {
    const snapshot = query(collection(firestore, "inventory"))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc)=>{
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })

    setInventory(inventoryList);
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1})
    } else {
      await setDoc(docRef, {quantity: 1})
    }

    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()

      if (quantity === 1){
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }

    await updateInventory()
  }

  function getAllPantryItems(){
    const pantryItems = []

    inventory.map(({name, quantity}) => {
      pantryItems.push(name)
    })

    return pantryItems
  }

  useEffect(() => {
    updateInventory();
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bgcolor="#FAF3E0"
      gap={2}
    >
      <Box width="100%" height="120px" bgcolor="#4CAF50" color="#e3e3e3" paddingLeft={4} paddingRight={4} display="flex" justifyContent="space-between" alignItems="center" marginBottom={6}>
        <Typography variant="h4" sx={{ ml: 2 }} fontFamily="roboto">Pantry Management System</Typography>
        <CustomAutocomplete
          disablePortal
          id="combo-box-demo"
          options={getAllPantryItems()}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Search Items" />}
        />
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box 
        position="absolute"
        top="50%" 
        left="50%" 
        width={400} 
        bgcolor="white" 
        border="2px solid #000" 
        boxShadow={24} 
        p={4} 
        display="flex" 
        flexDirection="column" 
        gap={3}
        sx={{
          transform: "translate(-50%, -50%)",
        }}
        >
          <Typography variant="h6">Add Items</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value)
            }}
            label="Item Name"
            ></TextField>
            <Button
            variant="outlined"
            onClick={() => {
              addItem(itemName)
              setItemName("")
              handleClose()
            }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box>
        <Box
          width="800px"
          height="100px"
          bgcolor="#98d99a"
          display="flex"
          alignItems="center" 
          justifyContent="space-between"
          p={6}
        >
          <Typography variant="h4" color="#333">Inventory Items</Typography>
          <Button
            variant="contained"
            onClick={() => {
              handleOpen()
            }}
          >
            Add New Item
          </Button>
        </Box>  
      </Box>
      <Stack 
        width="800px" 
        height="300px"
        spacing={2}
        overflow="auto"
        >
          {inventory.map(({name, quantity}) => (
          <Box
            key={name}
            width="100%"
            minHeight="80px"
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            bgcolor={'#bce6be'}
            paddingX={5}
          >
            <Typography variant={'h4'} color={'#333'} textAlign={'center'}>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>
            <Typography variant={'h4'} color={'#333'} textAlign={'center'}>
              {quantity}
            </Typography>
            <Button variant="contained" onClick={() => addItem(name)}>
              Add
            </Button>
            <Button variant="contained" onClick={() => removeItem(name)}>
              Remove
            </Button>
          </Box>
        ))}
        </Stack>
    </Box>
  );
}
