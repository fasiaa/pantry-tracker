"use client"
import { useState, useEffect, useRef } from "react"
import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material"
import { collection, doc, getDocs, getDoc, query, deleteDoc, setDoc, addDoc } from "firebase/firestore";
import CustomAutocomplete from "./customautocomplete";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  //------------------------------------Camera---------------------------------------------
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  const openCamera = async () => {
    setIsCameraOpen(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  };

  const closeCamera = () => {
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach(track => {
      track.stop();
    });

    videoRef.current.srcObject = null;
    setIsCameraOpen(false);
  };

  const takePicture = () => {
    const width = 640;
    const height = 480;
    const context = photoRef.current.getContext('2d');
    photoRef.current.width = width;
    photoRef.current.height = height;
    context.drawImage(videoRef.current, 0, 0, width, height);
    const dataURL = photoRef.current.toDataURL('image/png');
    setImageSrc(dataURL);
    closeCamera();
  };
  //---------------------------------------------------------------------------------------
  
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
    setFilteredItems(inventoryList);
  }
  
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item)
    const docSnap = await getDoc(docRef)

    if (imageSrc){
      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        await setDoc(docRef, {quantity: quantity + 1, image: imageSrc})
      } else {
        await setDoc(docRef, {quantity: 1, image: imageSrc})
      }
    } else {
        if (docSnap.exists()) {
          const { quantity } = docSnap.data()
          await setDoc(docRef, {quantity: quantity + 1, image: "no image"})
        } else {
          await setDoc(docRef, {quantity: 1, image: "no image"})
        }
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

  const handleSearch = (event, value) => {
    if (value) {
      setFilteredItems(inventory.filter(item => item.name.toLowerCase().includes(value.toLowerCase())));
    } else {
      setFilteredItems(inventory);
    }

    console.log(inventory)
  };
  
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
    // main box
    <Box
      width="100vw" height="100vh"
      display="flex" flexDirection="column"
      alignItems="center" justifyContent="center"
      bgcolor="#FAF3E0" gap={2}
    >
      {/* -----------------------------------navbar starts----------------------------------------------------------- */}
      <Box width="100%" height="120px" bgcolor="#4CAF50" color="#e3e3e3" paddingLeft={4} paddingRight={4} display="flex" justifyContent="space-between" alignItems="center" marginBottom={6} marginTop={-3}>
        <Typography variant="h4" fontFamily= "Monaco" sx={{ ml: 2, textShadow: '0px 4px 10px rgba(0, 0, 0, 0.4)' }}>Pantry Management System</Typography>
        <Box sx={{ boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.4)' }}>
            <CustomAutocomplete
              disablePortal
              id="combo-box-demo"
              options={getAllPantryItems()}
              sx={{ width: 300}}
              onChange={handleSearch}
              renderInput={(params) => <TextField {...params} label="Search Items" />}
              />
        </Box>
      </Box>
      {/* -----------------------------------navbar ends----------------------------------------------------------- */}
      {isCameraOpen && (
                <Box display="flex"  style={{ width: '80%', height: '80%' }} marginTop={50} marginBottom={5} flexDirection="column" justifyContent="center" alignItems="center" sx={{ zIndex: 1000 }}>
                  <video ref={videoRef} style={{ width: '600px', height: '440px' }}></video>
                  <Box flexDirection="row" display="flex" marginTop={2}>
                    <Button variant="contained"
                    sx={{ zIndex: 1100, mr: 2, backgroundColor: "#1a6b1c", "&:hover" : {backgroundColor: "#51c955"} }} 
                    onClick={() => {
                      takePicture()
                      addItem(itemName)
                      setItemName("")
                    }}>
                      Take Picture
                    </Button>
                    <Button variant="contained" sx={{ zIndex: 1100, mr: 2, backgroundColor: "#1a6b1c", "&:hover" : {backgroundColor: "#51c955"} }} onClick={closeCamera}>Close Camera</Button>
                    <canvas ref={photoRef} style={{ display: 'none' }}></canvas>
                    <TextField variant="outlined" required fullWidth value={itemName} onChange={(e) => {setItemName(e.target.value)}} label="Item Name"></TextField>
                  </Box>
                </Box>
              )}
      {/* -----------------------------------the add item popup starts----------------------------------------------------------- */}
      <Modal open={open} onClose={handleClose}>
        <Box 
        position="absolute"
        top="50%" left="50%" 
        width={400} 
        bgcolor="#d8f0d3" 
        border="2px solid #12240e" 
        boxShadow={24} 
        p={4} 
        display="flex" 
        flexDirection="column" 
        gap={3}
        sx={{
          transform: "translate(-50%, -50%)",
        }}
        >
          <Typography variant="h6" fontFamily="Verdana">Add Items</Typography>
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
      {/* -----------------------------------the add item popup ends----------------------------------------------------------- */}
      {/* -----------------------------------List of Items----------------------------------------------------------- */}
      <Box>
        {/* ---------------------------------------Heading starts--------------------------------------------------- */}
        <Box>
          <Box
            width="800px" height="100px"
            bgcolor="#98d99a"
            display="flex" 
            alignItems="center" justifyContent="space-between"
            sx = {{borderRadius: 4, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.4)' }}
            marginBottom={2} p={6}
            >
            <Typography  fontFamily="Verdana" variant="h4" color="#333">Inventory Items</Typography>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#1a6b1c", "&:hover" : {backgroundColor: "#51c955"}}}
              onClick={() => {
                handleOpen()
              }}
              >
              Add New Item
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#1a6b1c", "&:hover" : {backgroundColor: "#51c955"}}}
              onClick={() => {
                openCamera()
              }}
              >
              Take Picture
            </Button>
          </Box>  
        </Box>
        {/* ---------------------------------------Heading ends--------------------------------------------------- */}

        {/* ---------------------------------------Items starts--------------------------------------------------- */}
        <Stack 
          width="800px" 
          height="300px"
          spacing={2}
          overflow="auto"
          >
            {filteredItems.map(({name, quantity}) => (
              <Box
              key={name}
              width="100%"
              minHeight="60px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#bce6be'}
              sx = {{borderRadius: 4, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.4)'}}
              paddingX={5}
              >
              <Typography  fontFamily="Verdana" variant={'h5'} color={'#333'} textAlign={'center'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography fontFamily="Verdana" variant={'h5'} color={'#333'} textAlign={'center'}>
                Quantity: {quantity}
              </Typography>
              <Box display="flex">
                <Button variant="contained" sx={{ mr: 2, backgroundColor: "#1a6b1c", "&:hover" : {backgroundColor: "#51c955"}}} onClick={() => addItem(name)}>
                  <Typography variant="h6">+</Typography>
                </Button>
                <Button variant="contained" sx={{ backgroundColor: "#1a6b1c", "&:hover" : {backgroundColor: "#51c955"}}} onClick={() => removeItem(name)}>
                  <Typography variant="h6">-</Typography>
                </Button>
              </Box>
            </Box>
          ))}
          </Stack>
          {/* ---------------------------------------Items ends--------------------------------------------------- */}
      </Box>
      {/* -----------------------------------List of Items ends----------------------------------------------------------- */}
    </Box>
  );
}
