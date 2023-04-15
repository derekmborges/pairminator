import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import { HistoryRecord, Pair } from "../../models/interface"
import Typography from "@mui/material/Typography"
import { usePairminatorContext } from "../../context/PairminatorContext"
import Stack from "@mui/material/Stack"
import { useState } from "react"
import { IconButton } from "@mui/material"
import ClearIcon from '@mui/icons-material/Clear'
import { HistoryRecordDeleteModal } from "./HistoryRecordDeleteModal"

type Props = {
    historyRecord: HistoryRecord
    onDeleteRecord: (id: string) => void
}

export const HistoryRow = ({
    historyRecord,
    onDeleteRecord
}: Props): JSX.Element => {
    const { lanes, allPairees } = usePairminatorContext()

    const [hovering, setHovering] = useState<boolean>(false)
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false)

    const handleDeleteModalClose = async (id?: string) => {
        if (id) {
            onDeleteRecord(id)
        }
        setOpenDeleteModal(false)
        setHovering(false)
    }

    return (
        <Box
            key={historyRecord.date.valueOf()}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            component={Paper}
            elevation={hovering ? 2 : 0}
            pb={1}
        >
            <Stack
                p={1}
                width="100%"
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <Typography variant='h6'>
                    {historyRecord.date.toLocaleString()}
                </Typography>
                {hovering && (
                    <IconButton
                        size="small"
                        onClick={() => setOpenDeleteModal(true)}
                    >
                        <ClearIcon fontSize="inherit" />
                    </IconButton>
                )}
            </Stack>
            {historyRecord.pairs
                .sort((a: Pair, b: Pair) => {
                    const laneA = lanes?.find(l => l.id === a.laneId)
                    const laneB = lanes?.find(l => l.id === b.laneId)
                    return (laneA && laneB) ? laneA.number - laneB.number : 0
                })
                .map((pair: Pair) => {
                    const lane = lanes?.find(l => l.id === pair.laneId)
                    const pairee1 = allPairees?.find(p => p.id === pair.pairee1Id)
                    const pairee2 = pair.pairee2Id ? allPairees?.find(p => p.id === pair.pairee2Id) : null
                    return lane && pairee1 && (
                        <Stack direction='row' key={lane.id} pl={1}>
                            <Typography fontWeight={500} pr={1}>
                                {lane.number}:
                            </Typography>
                            <Typography variant='body1'>
                                {pairee1.name}
                            </Typography>
                            {pairee2 && (
                                <Typography variant='body1'>
                                    &nbsp;&&nbsp;{pairee2.name}
                                </Typography>
                            )}
                        </Stack>
                    )
                }
                )}
            <HistoryRecordDeleteModal
                open={openDeleteModal}
                historyRecord={historyRecord}
                handleClose={handleDeleteModalClose}
            />
        </Box>
    )
}