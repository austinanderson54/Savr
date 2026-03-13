import { Share } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import type React from 'react';
import type { View } from 'react-native';

export async function sharePlan(ref: React.RefObject<View | null>): Promise<void> {
  const uri = await captureRef(ref, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
  });

  await Share.share(
    {
      url: uri,
      message: 'My SAVR plan — this app tells me exactly what to do with my money next.',
    },
    { dialogTitle: 'Share My Plan' },
  );
}
