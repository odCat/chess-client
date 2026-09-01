import {Box, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import {useDispatch, useSelector} from "react-redux";
import {logout, update} from "../../store/actions/actions.js";
import {useNavigate} from "react-router";
import {useState} from "react";
import TextField from "@mui/material/TextField";


const SectionTitle = ({ children, ...props }) => (
    <Typography variant="h5" sx={{ mt: 5 }} {...props}>{children}</Typography>
);

export default function Settings() {

    const player = useSelector(store => store.player);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [username, setUsername] = useState(player.username);
    const [usernameError, setUsernameError] = useState(false);
    const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
    const [retypedPassword, setRetypedPassword] = useState("");
    const [matches, setMatches] = useState(true);
    const [fullName, setFullName] = useState(player.fullName || "");
    const [email, setEmail] = useState(player.email);
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState("");

    async function saveChanges()
    {
        setUsernameError(false);
        setPasswordError(false);
        setEmailError(false);

        if (password !== retypedPassword) {
            setMatches(false);
            return ;
        } else
            setMatches(true);

        let updateInfo = {};
        if (username != null && username !== player.username)
            updateInfo.username = username;
        if (password !== "" && matches)
            updateInfo.password = password;
        if (fullName != null && fullName !== player.fullName)
            updateInfo.fullName = fullName;
        if (email != null && email !== player.email)
            updateInfo.email = email;

        if (Object.keys(updateInfo).length === 0)
            return ;

        updateInfo = JSON.stringify(updateInfo);

        try {
            const response = await fetch("http://localhost:8080/players?id=" + player.id, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + player.password
                },
                body: updateInfo
            });
            const json = await response.json();
            if (response.ok) {
                dispatch(update(json));
                setPassword("");
                setRetypedPassword("");
            } else {
                if (json.username) {
                    setUsernameError(true);
                    setUsernameErrorMessage(json.username);
                }
                if (json.password) {
                    setPasswordError(true);
                    setPasswordErrorMessage(json.password);
                }
                if (json.email) {
                    setEmailError(true);
                    setEmailErrorMessage(json.email);
                }
            }
        } catch(error) {
            console.error(error.message);
        }
    }

    async function deleteAccount() {

        const response = await fetch("http://localhost:8080/players?id=" + player.id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + player.password
            }
        })

        if (response.ok) {
            dispatch(logout());
            navigate("/login");
        }
    }

    function handleClose() {
        setOpenDeleteDialog(false);
    }

    return (
        <Box sx={{ mb: 20 }}>
            <Typography variant="h4" sx={{ my: 10 }}>Settings</Typography>

            <SectionTitle sx={{ mt: 0 }}>Username</SectionTitle>
            <Divider sx={{width: "100%", mt: 1, mb: 2, borderColor: "#424548"}}/>
            <TextField
                id="username"
                value={username}
                error={usernameError}
                helperText={usernameError ? usernameErrorMessage : ""}
                onChange={(e) => setUsername(e.target.value) }
                fullWidth
                color="white"
                size="small"
                sx={{
                    '& .MuiInputBase-input': { color: '#fff' },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#424548' },
                        '&:hover fieldset': { borderColor: '#424548' },
                        '&.Mui-focused fieldset': { borderColor: '#424548' },
                    },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#424548' },
                }}
            />

            <SectionTitle>Password</SectionTitle>
            <Divider sx={{width: "100%", mt: 1, mb: 2, borderColor: "#424548"}}/>
            <TextField
                type="password"
                placeholder="Enter the new password"
                value={password}
                error={passwordError}
                helperText={passwordError ? passwordErrorMessage : ""}
                onChange={(e) => setPassword(e.target.value) }
                fullWidth
                color="white"
                size="small"
                sx={{
                    mb: 1,
                    '& .MuiInputBase-input': { color: '#fff' },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#424548' },
                        '&:hover fieldset': { borderColor: '#424548' },
                        '&.Mui-focused fieldset': { borderColor: '#424548' },
                    },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#424548' },
                }}
            />
            <TextField
                type="password"
                placeholder="(again)"
                value={retypedPassword}
                error={!matches}
                helperText={!matches ? "Passwords do not match" : ""}
                onChange={(e) => setRetypedPassword(e.target.value) }
                fullWidth
                color="white"
                size="small"
                sx={{
                    '& .MuiInputBase-input': { color: '#fff' },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#424548' },
                        '&:hover fieldset': { borderColor: '#424548' },
                        '&.Mui-focused fieldset': { borderColor: '#424548' },
                    },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#424548' },
                }}
            />

            <SectionTitle>Full name</SectionTitle>
            <Divider sx={{width: "100%", mt: 1, mb: 2, borderColor: "#424548"}}/>
            <TextField
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                fullWidth
                color="white"
                size="small"
                sx={{
                    '& .MuiInputBase-input': { color: '#fff' },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#424548' },
                        '&:hover fieldset': { borderColor: '#424548' },
                        '&.Mui-focused fieldset': { borderColor: '#424548' },
                    },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#424548' },
                }}
            />

            <SectionTitle>Email</SectionTitle>
            <Divider sx={{width: "100%", mt:1, mb: 2, borderColor: "#424548"}}/>
            <TextField
                id="email"
                value={email}
                error={emailError}
                helperText={emailError ? emailErrorMessage : ""}
                onChange={(e) => setEmail(e.target.value) }
                fullWidth
                color="white"
                size="small"
                sx={{
                    '& .MuiInputBase-input': { color: '#fff' },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#424548' },
                        '&:hover fieldset': { borderColor: '#424548' },
                        '&.Mui-focused fieldset': { borderColor: '#424548' },
                    },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#424548' },
                }}
            />

            <Button variant="contained" sx={{ mt: 5 }} onClick={ () => saveChanges() }>
                Save changes
            </Button>

            <SectionTitle sx={{ color: "#d73b3e", mt: 10 }}>Delete account</SectionTitle>
            <Divider sx={{width: "100%", my: 2, borderColor: "#424548"}}/>
            <Button variant="contained" color="error" onClick={ () => setOpenDeleteDialog(true) }>
                Delete your account
            </Button>

            <Dialog
                open={openDeleteDialog}
                onClose={handleClose}
            >
                <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
                <DialogContent>This action cannot be undone.</DialogContent>
                <DialogActions>
                    <Button onClick={deleteAccount} variant="contained" color="error">Delete</Button>
                    <Button onClick={handleClose} variant="outlined">Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}