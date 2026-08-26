import Box from "@mui/material/Box";
import {useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import Typography from "@mui/material/Typography";
import {Card, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import {styled} from "@mui/material/styles";


const Cell = styled(TableCell) ({
    paddingTop: 3,
    paddingBottom: 3,
    color: "#bbbbbb"
});

export default function Profile() {

    const params = useParams();
    const navigate = useNavigate();
    // const [player, setPlayer] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {

        if (!params.playerId) return;

        const getPlayerInfo = async function(id) {
            console.log(`Getting player ${id} info`);
        }

        const getPlayerHistory = async function(id) {

            try {
                const response = await fetch("http://localhost:8080/players/history/" + id);
                const json = await response.json();
                setHistory(json.sort((a, b) => a.date.localeCompare(b.date)));
            } catch {
                // do nothing
            }
        }

        getPlayerInfo().then();
        getPlayerHistory(params.playerId).then();
    }, [params.playerId]);

    function goToGame(event) {
        navigate("/games/id/" + event.currentTarget.id);
    }

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
        }}>
            <Typography variant="h5">Game History</Typography>
                <Card variant="outlined"
                    sx={{
                        border: "1px solid",
                        bgcolor: "#474747",
                        borderColor: "#b9b9b9",
                        borderRadius: 0
                    }}
                >
                    <Table id="game_history" sx={{
                    }}>
                        <TableHead>
                            <TableRow>
                                <Cell sx={{ color: "#bbbbbb"}}>White</Cell>
                                <Cell>Black</Cell>
                                <Cell>Date</Cell>
                                <Cell>Result</Cell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {history.map((game) => {
                                return (
                                    <TableRow id={game.id} key={game.id} onClick={goToGame}
                                        sx={{
                                            "&:hover": {
                                                backgroundColor: "#515151",
                                                cursor: "pointer"
                                            }
                                    }}>
                                        <Cell>{game.white}</Cell>
                                        <Cell>{game.black}</Cell>
                                        <Cell>{game.date}</Cell>
                                        <Cell>{game.result}</Cell>
                                    </TableRow>
                                )}
                            )}
                        </TableBody>
                    </Table>
                </Card>
        </Box>
    );
}