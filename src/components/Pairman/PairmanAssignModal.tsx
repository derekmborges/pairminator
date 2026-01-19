import React, { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { usePairminatorContext } from '../../context/PairminatorContext'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import LoadingButton from '@mui/lab/LoadingButton'
import { Pairee } from '../../models/interface'
import CircularProgress from '@mui/material/CircularProgress'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'

type Props = {
    open: boolean
    handleClose: (paireeId?: string) => void
}

export const PairmanAssignModal = ({
    open,
    handleClose
}: Props) => {
    const { project, activePairees, getSuggestedPairman } = usePairminatorContext()
    const [suggestedPairman, setSuggestedPairman] = useState<Pairee | null>(null)
    const [selectedPaireeId, setSelectedPaireeId] = useState<string | null>(null)
    const [manualPaireeId, setManualPaireeId] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [saving, setSaving] = useState<boolean>(false)

    useEffect(() => {
        if (open) {
            setSaving(false)

            setLoading(true)
            const suggestion = getSuggestedPairman()
            if (suggestion) {
                setSuggestedPairman(suggestion)
                setSelectedPaireeId(suggestion.id)
            }
            setLoading(false)
        }
    }, [open, getSuggestedPairman])

    const confirmElection = () => {
        if (selectedPaireeId) {
            setSaving(true)
            handleClose(selectedPaireeId)
        }
    }

    const title = project?.currentPairman
        ? 'Overthrow Pairman'
        : 'Assign a Pairman'

    const subtitle = project?.currentPairman
        ? "I see you've decided it's time for a change, I don't blame you. Let's get rid of this pairman and elect someone new into office."
        : "Since this will be the first Pairman of your project's history, I have sovereignly decided who it should be (totally not random at all)."

    enum ElectionOption {
        RECOMMENDED = "recommended",
        MANUAL = "manual"
    }
    const [electionOption, setElectionOption] = useState<ElectionOption>(ElectionOption.RECOMMENDED)
    const handleElectionOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const electionOption = (event.target as HTMLInputElement).value as ElectionOption
        setElectionOption(electionOption)
    };

    useEffect(() => {
        if (electionOption === ElectionOption.MANUAL) {
            setSelectedPaireeId(manualPaireeId)
        } else if (suggestedPairman) {
            setSelectedPaireeId(suggestedPairman.id)
        }
    }, [electionOption, suggestedPairman, manualPaireeId, setSelectedPaireeId, ElectionOption.MANUAL])

    return (
        <Dialog open={open} onClose={() => handleClose()}>
            <DialogTitle>{title}</DialogTitle>
            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    <DialogContent>{subtitle}</DialogContent>
                    <DialogContent>
                        {suggestedPairman && activePairees && (
                            <>
                                <FormControl>
                                    <FormLabel id="pairman-option-group-label">Elect a Pairman</FormLabel>
                                    <RadioGroup
                                        aria-labelledby="pairman-option-group-label"
                                        name="radio-buttons-group"
                                        value={electionOption}
                                        onChange={handleElectionOptionChange}
                                    >
                                        <FormControlLabel value={ElectionOption.RECOMMENDED} control={<Radio />} label={`Recommended: ${suggestedPairman.name}`} />
                                        <FormControlLabel value={ElectionOption.MANUAL} control={<Radio />} label="Manually select" />
                                        <Autocomplete
                                            id="combo-box-pairees"
                                            disabled={electionOption !== ElectionOption.MANUAL}
                                            options={activePairees}
                                            sx={{ width: 300 }}
                                            getOptionLabel={(option: Pairee) => option.name}
                                            isOptionEqualToValue={(option: Pairee, value: Pairee) => option.id === value.id}
                                            renderInput={(params) => <TextField {...params} label="Pairees" />}
                                            onChange={(_, value: Pairee | null) => {
                                                setManualPaireeId(value ? value.id : null)
                                            }}
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            color="inherit"
                            onClick={() => handleClose()}
                        >
                            Maybe Later
                        </Button>
                        <LoadingButton
                            color="success"
                            variant="contained"
                            onClick={confirmElection}
                            loading={saving}
                            disabled={!selectedPaireeId}
                        >
                            Elect
                        </LoadingButton>
                    </DialogActions>
                </>
            )}
        </Dialog>
    )
}
