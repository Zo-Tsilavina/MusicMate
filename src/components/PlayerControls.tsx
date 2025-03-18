import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Track } from '../types';

interface PlayerControlsProps {
  track: Track;
  isPlaying: boolean;
  onPrevious: () => void;
  onTogglePlayback: () => void;
  onNext: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  track,
  isPlaying,
  onPrevious,
  onTogglePlayback,
  onNext,
}) => (
  <View style={styles.playerControls}>
    {track.cover ? (
      <Image source={{ uri: track.cover }} style={styles.coverImage} />
    ) : (
      <View style={styles.coverPlaceholder}>
        <Text style={styles.coverPlaceholderText}>Pas de pochette</Text>
      </View>
    )}
    <Text style={styles.currentTrack}>{track.title}</Text>
    <Text style={styles.currentTrackSubText}>
      {track.artist} - {track.album}
    </Text>
    <View style={styles.buttonRow}>
      <TouchableOpacity style={styles.controlButton} onPress={onPrevious}>
        <Text style={styles.buttonText}>Précédent</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.controlButton} onPress={onTogglePlayback}>
        <Text style={styles.buttonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.controlButton} onPress={onNext}>
        <Text style={styles.buttonText}>Suivant</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  playerControls: {
    padding: 10,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
  },
  coverImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginBottom: 10,
  },
  coverPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 5,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  coverPlaceholderText: {
    color: '#fff',
    fontSize: 12,
  },
  currentTrack: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  currentTrackSubText: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  controlButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PlayerControls;