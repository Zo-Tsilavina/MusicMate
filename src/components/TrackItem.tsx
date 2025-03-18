import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Track } from '../types';

interface TrackItemProps {
  track: Track;
  onPress: () => void;
}

const TrackItem: React.FC<TrackItemProps> = ({ track, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.item}>
      <Text style={styles.itemText}>{track.title}</Text>
      <Text style={styles.itemSubText}>{track.artist} - {track.album}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  itemText: {
    fontSize: 16,
    color: '#fff',
  },
  itemSubText: {
    fontSize: 14,
    color: '#bbb',
  },
});

export default TrackItem;