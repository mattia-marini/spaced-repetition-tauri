use super::flashcard::JsonInfos;
use std::{collections::HashMap, fs, path::Path};

pub fn parse_json(file_content: &str) -> serde_json::Result<HashMap<usize, JsonInfos>> {
    serde_json::from_str(file_content)
}
