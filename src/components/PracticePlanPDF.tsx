import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PracticePlan } from '../types';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    fontSize: 12,
  },
  warmup: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  warmupTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  equipment: {
    marginBottom: 20,
  },
  equipmentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  equipmentItem: {
    backgroundColor: '#f7f7f7',
    padding: 5,
    borderRadius: 3,
    fontSize: 10,
  },
  drill: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f7f7f7',
  },
  drillTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  drillDetails: {
    fontSize: 10,
    color: '#666',
  },
});

interface Props {
  plan: PracticePlan;
}

export const PracticePlanPDF: React.FC<Props> = ({ plan }) => {
  const uniqueEquipment = Array.from(
    new Set(plan.drills.flatMap(drill => drill.equipment))
  ).sort();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Practice Plan for {plan.teamName}
          </Text>
          <View style={styles.details}>
            <Text>Date: {new Date(plan.date).toLocaleDateString()}</Text>
            <Text>Duration: {plan.duration} minutes</Text>
            <Text>Location: {plan.location}</Text>
          </View>
        </View>

        {plan.warmup?.enabled && (
          <View style={styles.warmup}>
            <Text style={styles.warmupTitle}>Warmup</Text>
            <Text style={styles.drillDetails}>
              Duration: {plan.warmup.duration} minutes
            </Text>
          </View>
        )}

        {uniqueEquipment.length > 0 && (
          <View style={styles.equipment}>
            <Text style={styles.equipmentTitle}>Equipment Needed:</Text>
            <View style={styles.equipmentList}>
              {uniqueEquipment.map((item) => (
                <Text key={item} style={styles.equipmentItem}>
                  {item}
                </Text>
              ))}
            </View>
          </View>
        )}

        {plan.drills.map((drill) => (
          <View key={drill.id} style={styles.drill}>
            <Text style={styles.drillTitle}>{drill.name}</Text>
            <Text style={styles.drillDetails}>
              Category: {drill.category} | Duration: {drill.duration} minutes
            </Text>
            <Text style={styles.drillDetails}>
              Equipment: {drill.equipment.join(', ')}
            </Text>
            <Text style={styles.drillDetails}>
              {drill.description}
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};